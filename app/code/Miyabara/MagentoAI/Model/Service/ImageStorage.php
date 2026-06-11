<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

// phpcs:disable Generic.Files.LineLength

declare(strict_types=1);

namespace Miyabara\MagentoAI\Model\Service;

use Magento\Catalog\Model\Product\Media\Config as MediaConfig;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem;
use Magento\Framework\HTTP\Client\CurlFactory;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

/**
 * Shared helper for reading and writing product images to the media directory.
 *
 * Used by both image generation and image modification so the dispersion-path
 * persistence logic lives in a single place.
 */
class ImageStorage
{
    /**
     * @param Filesystem   $filesystem
     * @param MediaConfig  $mediaConfig
     * @param CurlFactory  $curlFactory
     */
    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly MediaConfig $mediaConfig,
        private readonly CurlFactory $curlFactory
    ) {}

    /**
     * Save image binary to the product media temp directory and return gallery-compatible file data.
     *
     * The file is stored using Magento's standard two-level dispersion path (/m/a/filename.jpg).
     * Appending .tmp signals Magento to move the file to the permanent location on product save.
     *
     * @param string $imageData Raw binary content
     * @param string $mimeType
     * @param string $ext
     * @return array{file: string, url: string, name: string, size: int, type: string}
     * @throws AiServiceException
     */
    public function persist(string $imageData, string $mimeType, string $ext): array
    {
        $fileName = 'mageai_' . uniqid('', true) . '.' . $ext;
        $dispersionPath = \Magento\Framework\File\Uploader::getDispersionPath($fileName);
        $fileRelativeToTmp = $dispersionPath . '/' . $fileName;

        try {
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            $tmpBase = $this->mediaConfig->getBaseTmpMediaPath();
            $mediaDirectory->create($tmpBase . $dispersionPath);
            $mediaDirectory->writeFile($tmpBase . $fileRelativeToTmp, $imageData);
        } catch (\Exception $e) {
            throw new AiServiceException(__('Failed to save image: %1', $e->getMessage()));
        }

        return [
            'name' => $fileName,
            'size' => strlen($imageData),
            'type' => $mimeType,
            'url'  => $this->mediaConfig->getTmpMediaUrl($fileRelativeToTmp),
            'file' => $fileRelativeToTmp . '.tmp',
        ];
    }

    /**
     * Read the binary content of an existing product image referenced by a gallery "file" value.
     *
     * Handles both saved images (/m/a/foo.jpg under catalog/product) and freshly added
     * not-yet-saved images whose file value still carries the ".tmp" suffix.
     *
     * @param string $file Gallery imageData.file value
     * @return array{data: string, mimeType: string, ext: string}
     * @throws AiServiceException
     */
    public function readOriginal(string $file): array
    {
        $file = trim($file);
        if ($file === '') {
            throw new AiServiceException(__('No source image was provided to modify.'));
        }

        $isTmp    = str_ends_with($file, '.tmp');
        $relative = $isTmp ? substr($file, 0, -4) : $file;
        $mediaPath = $isTmp
            ? $this->mediaConfig->getTmpMediaPath($relative)
            : $this->mediaConfig->getMediaPath($relative);

        try {
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            if (!$mediaDirectory->isExist($mediaPath)) {
                throw new AiServiceException(__('The original product image could not be found on the server.'));
            }
            $data = $mediaDirectory->readFile($mediaPath);
        } catch (AiServiceException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new AiServiceException(__('Failed to read the original product image: %1', $e->getMessage()));
        }

        if ($data === '' || $data === false) {
            throw new AiServiceException(__('The original product image is empty or unreadable.'));
        }

        $dotPos = strrpos($relative, '.');
        $ext    = $dotPos !== false ? strtolower(substr($relative, $dotPos + 1)) : 'jpg';

        return ['data' => $data, 'mimeType' => $this->resolveMimeType($ext), 'ext' => $ext];
    }

    /**
     * Write raw image bytes to a throwaway file and return its absolute path.
     *
     * Used to build a CURLFile for multipart uploads (e.g. OpenAI image edits endpoint).
     * The caller must remove the file afterwards via removeTempFile().
     *
     * @param string $imageData
     * @param string $ext
     * @return array{path: string, absolutePath: string}
     * @throws AiServiceException
     */
    public function writeTempFile(string $imageData, string $ext): array
    {
        $relative = 'mageai_src_' . uniqid('', true) . '.' . $ext;
        $path     = $this->mediaConfig->getBaseTmpMediaPath() . '/' . $relative;

        try {
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            $mediaDirectory->writeFile($path, $imageData);
            $absolutePath = $mediaDirectory->getAbsolutePath($path);
        } catch (\Exception $e) {
            throw new AiServiceException(__('Failed to prepare the source image for modification: %1', $e->getMessage()));
        }

        return ['path' => $path, 'absolutePath' => $absolutePath];
    }

    /**
     * Remove a temporary file previously created via writeTempFile(). Best-effort — never throws.
     *
     * @param string $path Relative-to-media path
     * @return void
     */
    public function removeTempFile(string $path): void
    {
        try {
            $mediaDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            if ($mediaDirectory->isExist($path)) {
                $mediaDirectory->delete($path);
            }
        } catch (\Exception $e) {
            return;
        }
    }

    /**
     * Download image binary from a URL using a fresh Curl instance to prevent auth header leakage.
     *
     * @param string $url
     * @return string
     * @throws AiServiceException
     */
    public function download(string $url): string
    {
        $curl = $this->curlFactory->create();
        $curl->setTimeout(60);
        $curl->setOption(CURLOPT_FOLLOWLOCATION, true);

        try {
            $curl->get($url);
        } catch (\Exception $e) {
            throw new AiServiceException(__('Failed to download image: %1', $e->getMessage()));
        }

        $data = $curl->getBody();
        if ($curl->getStatus() >= 400 || $data === '') {
            throw new AiServiceException(__('Failed to download image (HTTP %1).', $curl->getStatus()));
        }

        return $data;
    }

    /**
     * Map a file extension to an image MIME type, defaulting to image/jpeg.
     *
     * @param string $ext
     * @return string
     */
    private function resolveMimeType(string $ext): string
    {
        return match ($ext) {
            'png'  => 'image/png',
            'webp' => 'image/webp',
            'gif'  => 'image/gif',
            default => 'image/jpeg',
        };
    }
}
