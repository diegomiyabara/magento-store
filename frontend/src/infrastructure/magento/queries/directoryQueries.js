export const COUNTRY_QUERY = `
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
