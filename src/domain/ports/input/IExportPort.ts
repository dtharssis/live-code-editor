import { VariableStore } from '../../entities/Variable';

export interface IExportHtmlPort {
  execute(
    name:   string,
    markup: string,
    css:    string,
    js:     string,
  ): Promise<void>;
}

export interface IExportShopifyPort {
  execute(
    name:      string,
    markup:    string,
    css:       string,
    js:        string,
    variables: VariableStore,
  ): Promise<void>;
}
