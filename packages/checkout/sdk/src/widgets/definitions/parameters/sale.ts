import { WalletProviderName } from '../../../types';

/**
 * Sale Widget parameters
 * @property {string} amount - The total price to pay for the items in the sale
 * @property {SaleItem[]} items - The list of products to be purchased
 * @property {WalletProviderName | undefined} walletProviderName - The wallet provider name to default to if no web3Provider is passed
 */
export type SaleWidgetParams = {
  amount?: string;
  // Fixme: pass environmentId through from sdk when it is sorted with hub
  environmentId?: string;
  fromContractAddress?: string;
  items?: SaleItem[];
  walletProviderName?: WalletProviderName;
};

export type SaleItem = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
