export interface CommandCatalogSubsystem {
  hex_code: string;
  name: string;
}

export interface CommandCatalogItem {
  id: number;
  name: string;
  cmd_id: number;
  allowed_destinations: string[];
  required_data_fields?: Array<string | number | null>;
  subsystems?: CommandCatalogSubsystem[];
}

export interface DestinationOption {
  key: string;
  value: number;
  code: string;
  label: string;
}