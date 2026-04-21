import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class VerificarEmail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Verificar Email',
		name: 'verificarEmail',
		icon: 'file:email.png',
		group: ['transform'],
		version: 1,
		description: 'Verificar la validez de un correo electronico usando emailable.com',
		defaults: {
			name: 'Verificar Email',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'verificarEmailApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Dirección De Email',
				name: 'email',
				type: 'string',
				placeholder: 'test@domain.com',
				default: '',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: Array<{json: IDataObject}> = []; // Aquí usas IDataObject

    for (let i = 0; i < items.length; i++) {
      const email = this.getNodeParameter('email', i) as string;

      // Eliminamos getCredentials y apiKey manual
      const response = await this.helpers.httpRequestWithAuthentication.call(this, 'verificarEmailApi', {
          method: 'GET',
          url: 'https://api.emailable.com/v1/verify',
          qs: {
              email: email,
          },
          headers: {
              Accept: 'application/json',
          },
          json: true,
      });

      const results = Array.isArray(response) ? response : [response];

      for (const result of results) {
          returnData.push({
              json: {
                  email: result.email,
                  deliverable: result.state === 'deliverable',
                  score: result.score,
              }
          });
      }
    }
    return [returnData as INodeExecutionData[]];
  }
}
