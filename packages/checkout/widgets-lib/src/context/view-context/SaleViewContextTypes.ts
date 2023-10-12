import { ViewType } from './ViewType';

export enum SaleWidgetViews {
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  PAY_WITH_COINS = 'PAY_WITH_COINS',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  FUND_WITH_SMART_CHECKOUT = 'FUND_WITH_SMART_CHECKOUT',
  SALE_SUCCESS = 'SALE_SUCCESS',
  SALE_FAIL = 'SALE_FAIL',
}

export type SaleWidgetView =
  | SaleMethodsView
  | SaleWithCoinsView
  | SaleWithCardView
  | SaleSmartCheckoutView
  | SaleSuccessView
  | SaleFailView;

interface SaleMethodsView extends ViewType {
  type: SaleWidgetViews.PAYMENT_METHODS;
}
interface SaleWithCoinsView extends ViewType {
  type: SaleWidgetViews.PAY_WITH_COINS;
}
interface SaleWithCardView extends ViewType {
  type: SaleWidgetViews.PAY_WITH_CARD;
}
interface SaleSmartCheckoutView extends ViewType {
  type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT;
  subView: FundWithSmartCheckoutSubViews;
}
interface SaleSuccessView extends ViewType {
  type: SaleWidgetViews.SALE_SUCCESS;
}
interface SaleFailView extends ViewType {
  type: SaleWidgetViews.SALE_FAIL;
  reason?: string;
}

export enum FundWithSmartCheckoutSubViews {
  INIT = 'INIT',
  LOADING = 'LOADING',
  FUNDING_ROUTE_SELECT = 'FUNDING_ROUTE_SELECT',
  FUNDING_ROUTE_EXECUTE = 'FUNDING_ROUTE_EXECUTE',
  DONE = 'DONE', // FIXME: todo remove once we have a success view
}