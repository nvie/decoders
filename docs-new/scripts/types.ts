export interface DecoderSignature {
  type_params?: string[];
  params?: Array<[string | null, string]>;
  return_type: string;
}

export interface DecoderInfo {
  section: string;
  params?: Array<[string, string]>;
  type_params?: string[];
  return_type?: string;
  signatures?: DecoderSignature[];
  example?: string;
  markdown?: string;
  aliases?: string[];
  alias_of?: string;
}

export interface DecoderMethodInfo {
  params?: Array<[string, string]>;
  type_params?: string[];
  return_type: string;
  signatures?: DecoderSignature[];
  example?: string;
  markdown?: string;
}

export interface SourceLocation {
  name: string;
  comment?: string | null;
  span: { start: number; end: number };
  localPath: string;
  remotePath: string;
  remote: string;
}

export interface DecodersData {
  decoders: Record<string, DecoderInfo>;
  decoder_methods: Record<string, DecoderMethodInfo>;
  locations: Record<string, string>;
  doc_strings: Record<string, string>;
  decoders_by_section: Record<string, string[]>;
}