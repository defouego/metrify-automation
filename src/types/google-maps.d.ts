
declare interface Window {
  google: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options?: {
            types?: string[];
            componentRestrictions?: {
              country: string | string[];
            };
          }
        ) => {
          addListener: (event: string, callback: () => void) => void;
          getPlace: () => {
            formatted_address?: string;
            geometry?: {
              location: {
                lat: () => number;
                lng: () => number;
              };
            };
          };
        };
      };
    };
  };
}
