export interface CommandCatalogItem {
  id: number;
  name: string;
  cmd_id: number;
  allowed_destinations: string[];
}

export interface DestinationOption {
  key: string;
  value: number;
  code: string;
}