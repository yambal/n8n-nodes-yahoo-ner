import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

interface NerEntity {
  text: string;
  type: string;
  offset: number;
  length: number;
}

interface NerResponse {
  id: string;
  jsonrpc: string;
  result: {
    entityList: NerEntity[];
  };
}

export class YahooNer implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Yahoo! NER',
    name: 'yahooNer',
    icon: 'file:yahoo-ner.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Yahoo! Japan 固有表現抽出 API を使用してテキストから固有表現を抽出',
    defaults: {
      name: 'Yahoo! NER',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'yahooApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Extract',
            value: 'extract',
            description: 'テキストから固有表現を抽出',
            action: 'テキストから固有表現を抽出',
          },
        ],
        default: 'extract',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['extract'],
          },
        },
        description: '固有表現を抽出するテキスト（最大4KB）',
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'Full',
            value: 'full',
            description: 'text, type, offset, length を含む完全な情報',
          },
          {
            name: 'Text Only',
            value: 'textOnly',
            description: 'テキストのみの配列',
          },
          {
            name: 'Grouped by Type',
            value: 'grouped',
            description: 'エンティティタイプごとにグループ化',
          },
        ],
        default: 'full',
        displayOptions: {
          show: {
            operation: ['extract'],
          },
        },
        description: '出力形式を選択',
      },
      {
        displayName: 'Filter by Entity Types',
        name: 'entityTypes',
        type: 'multiOptions',
        options: [
          { name: '組織名 (ORGANIZATION)', value: 'ORGANIZATION' },
          { name: '人名 (PERSON)', value: 'PERSON' },
          { name: '地名 (LOCATION)', value: 'LOCATION' },
          { name: '固有物名 (ARTIFACT)', value: 'ARTIFACT' },
          { name: '日付表現 (DATE)', value: 'DATE' },
          { name: '時間表現 (TIME)', value: 'TIME' },
          { name: '金額表現 (MONEY)', value: 'MONEY' },
          { name: '割合表現 (PERCENT)', value: 'PERCENT' },
        ],
        default: [],
        displayOptions: {
          show: {
            operation: ['extract'],
          },
        },
        description: '抽出するエンティティタイプを選択（空の場合は全タイプ）',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('yahooApi');
    const clientId = credentials.clientId as string;

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;

      if (operation === 'extract') {
        const text = this.getNodeParameter('text', i) as string;
        const outputFormat = this.getNodeParameter('outputFormat', i) as string;
        const entityTypes = this.getNodeParameter('entityTypes', i) as string[];

        const requestBody = {
          id: '1',
          jsonrpc: '2.0',
          method: 'jlp.nerservice.extract',
          params: {
            q: text,
          },
        };

        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: 'https://jlp.yahooapis.jp/NERService/V1/extract',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `Yahoo AppID: ${clientId}`,
          },
          body: requestBody,
          json: true,
        });

        const nerResponse = response as NerResponse;
        let entities = nerResponse.result?.entityList || [];

        // Filter by entity types if specified
        if (entityTypes.length > 0) {
          entities = entities.filter((entity) => entityTypes.includes(entity.type));
        }

        let output: any;

        switch (outputFormat) {
          case 'textOnly':
            output = {
              entities: entities.map((e) => e.text),
              originalText: text,
              count: entities.length,
            };
            break;

          case 'grouped':
            const grouped: Record<string, string[]> = {};
            for (const entity of entities) {
              if (!grouped[entity.type]) {
                grouped[entity.type] = [];
              }
              grouped[entity.type].push(entity.text);
            }
            output = {
              entities: grouped,
              originalText: text,
              count: entities.length,
            };
            break;

          case 'full':
          default:
            output = {
              entities: entities,
              originalText: text,
              count: entities.length,
            };
            break;
        }

        returnData.push({ json: output });
      }
    }

    return [returnData];
  }
}
