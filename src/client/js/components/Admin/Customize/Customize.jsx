
import React, { Fragment, Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeTitle from './CustomizeTitle';

const logger = loggerFactory('growi:services:AdminCustomizePage');

function CustomizePageWithContainerWithSusupense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <CustomizePageWithUnstatedContainer />
    </Suspense>
  );
}

function Customize(props) {
  const { adminCustomizeContainer } = props;

  if (adminCustomizeContainer.state.currentTheme === adminCustomizeContainer.dummyCurrentTheme) {
    throw new Promise(async() => {
      try {
        await adminCustomizeContainer.retrieveCustomizeData();
      }
      catch (err) {
        toastError(err);
        adminCustomizeContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
    });
  }

  return (
    <Fragment>
      <div className="mb-5">
        <CustomizeLayoutSetting />
      </div>
      <div className="mb-5">
        <CustomizeFunctionSetting />
      </div>
      <div className="mb-5">
        <CustomizeHighlightSetting />
      </div>
      <div className="mb-5">
        <CustomizeTitle />
      </div>
      <div className="mb-5">
        <CustomizeHeaderSetting />
      </div>
      <div className="mb-5">
        <CustomizeCssSetting />
      </div>
      <div className="mb-5">
        <CustomizeScriptSetting />
      </div>
    </Fragment>
  );
}

const CustomizePageWithUnstatedContainer = withUnstatedContainers(Customize, [AdminCustomizeContainer]);

Customize.propTypes = {
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default CustomizePageWithContainerWithSusupense;
