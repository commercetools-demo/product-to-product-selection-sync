import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { logger } from '../utils/logger.utils.js';
import { ProductSelection } from '@commercetools/platform-sdk';

const ATTRIBUTE_NAME = process.env.ATTRIBUTE_NAME;
export async function getProductAttribute(productId: string): Promise<string> {
  logger.info(`Getting attribute form product ${productId}`);
  return await createApiRoot()
    .products()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get()
    .execute()
    .then((response) => {
      const attributes =
        response.body.masterData?.staged?.masterVariant?.attributes || [];
      const productSelectionAttribute = attributes?.find(
        (attribute) => attribute?.name === ATTRIBUTE_NAME
      );
      if (!productSelectionAttribute?.value) {
        throw new Error('Product attribute not found');
      }
      logger.info(
        `Product attribute found: ${productSelectionAttribute?.value}`
      );
      return productSelectionAttribute.value;
    })
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}
export async function getProductSelectionByKey(
  productSelectionKey: string
): Promise<ProductSelection> {
  logger.info(`Getting product selection ${productSelectionKey}`);
  return await createApiRoot()
    .productSelections()
    .withKey({ key: productSelectionKey })
    .get()
    .execute()
    .then((response) => {
      logger.info(`Product selection found: ${response.body.key}`);
      return response.body;
    })
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}
