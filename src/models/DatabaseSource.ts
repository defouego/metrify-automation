
export interface DatabaseSource {
  id: string;            // uuid
  name: string;          // nom lisible
  type: 'sql'|'api'|'prometheus'|'csv'|'excel'; // type de source
  config: any;           // objet JSON libre (url, credentials…)
}
