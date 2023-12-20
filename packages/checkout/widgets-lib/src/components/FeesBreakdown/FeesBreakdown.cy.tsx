import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Button } from '@biom3/react';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../lib/testUtils';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FeesBreakdown } from './FeesBreakdown';

describe('FeesBreakdown', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should the total fees amount, even if there are no sub fees', () => {
    mount(
      <ViewContextTestComponent>
        <SimpleLayout>
          <FeesBreakdown fees={[]} totalAmount="1.0" totalFiatAmount="Approx USD $0.70" tokenSymbol="IMX">
            <Button testId="fee-button">
              Fees
            </Button>
          </FeesBreakdown>
        </SimpleLayout>
      </ViewContextTestComponent>,
    );
    cySmartGet('fee-button').click();
    cySmartGet('Drawer__container__header').should('be.visible');
    cySmartGet('Drawer__container__header').should('have.text', 'Fee breakdown');
    cySmartGet('fees-breakdown-content').should('be.visible');
    cySmartGet('fee-item-fees-total').should('be.visible');
    cySmartGet('fees-total__price').should('have.text', 'IMX 1');
    cySmartGet('fees-total__fiatAmount').should('have.text', 'Approx USD $0.70');
  });

  it('should enumerate the provided fees', () => {
    const fees = [
      {
        label: 'Gas fee',
        fiatAmount: 'Approx USD $1234.0',
        amount: '0.12345',
      },
      {
        label: 'Maker fee',
        fiatAmount: 'Approx USD $5544.0',
        amount: '1234.444',
      },
    ];
    mount(
      <ViewContextTestComponent>
        <SimpleLayout>
          <FeesBreakdown fees={fees} totalAmount="1.0" totalFiatAmount="Approx USD $0.70" tokenSymbol="IMX">
            <Button testId="fee-button">
              Fees
            </Button>
          </FeesBreakdown>
        </SimpleLayout>
      </ViewContextTestComponent>,
    );
    cySmartGet('fee-button').click();
    cySmartGet('fees-breakdown-content').should('be.visible');

    cySmartGet('fee-item-gas-fee').should('be.visible');
    cySmartGet('gas-fee__price').should('have.text', 'IMX 0.123450'); // TODO: This should not be formatting with a zero on the end if only 5 decimal places
    cySmartGet('gas-fee__fiatAmount').should('have.text', 'Approx USD $1,234.0');

    cySmartGet('fee-item-maker-fee').should('be.visible');
    cySmartGet('maker-fee__price').should('have.text', 'IMX 1,234.44');
    cySmartGet('maker-fee__fiatAmount').should('have.text', 'Approx USD $5,544.0');
  });
});
