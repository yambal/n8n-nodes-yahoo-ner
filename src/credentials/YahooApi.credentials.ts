import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class YahooApi implements ICredentialType {
  name = 'yahooApi';
  displayName = 'Yahoo! Japan API';
  documentationUrl = 'https://developer.yahoo.co.jp/start/';
  properties: INodeProperties[] = [
    {
      displayName: 'Client ID (Application ID)',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'Yahoo! Japan Developer Network で取得した Client ID（アプリケーションID）',
    },
  ];
}
