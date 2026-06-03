export const COUNTRY_QUERY: string = `
  query CountryQuery($id: String!) {
    country(id: $id) {
      id
      full_name_locale
      available_regions {
        id
        code
        name
      }
    }
  }
`;
