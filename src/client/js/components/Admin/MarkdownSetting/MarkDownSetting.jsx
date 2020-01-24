import React from 'react';
import { Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import LineBreakForm from './LineBreakForm';
import PresentationForm from './PresentationForm';
import XssForm from './XssForm';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

const logger = loggerFactory('growi:MarkDown');

class MarkdownSetting extends React.Component {

  async componentDidMount() {
    const { adminMarkDownContainer } = this.props;

    try {
      await adminMarkDownContainer.retrieveMarkdownData();
    }
    catch (err) {
      toastError(err);
      adminMarkDownContainer.setState({ retrieveError: err });
      logger.error(err);
    }

  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        {/* Line Break Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.line_break_setting') }</h2>
          <Card className="card-well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.line_break_setting_desc') }</CardBody>
          </Card>
          <LineBreakForm />
        </div>

        {/* Presentation Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.presentation_setting') }</h2>
          <Card className="card-well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.presentation_setting_desc') }</CardBody>
          </Card>
          <PresentationForm />
        </div>

        {/* XSS Setting */}
        <div className="row mb-5">
          <h2 className="border-bottom col-12">{ t('markdown_setting.XSS_setting') }</h2>
          <Card className="card-well col-12">
            <CardBody className="px-2 py-3">{ t('markdown_setting.XSS_setting_desc') }</CardBody>
          </Card>
          <XssForm />
        </div>
      </React.Fragment>
    );
  }

}

const MarkdownSettingWrapper = (props) => {
  return createSubscribedElement(MarkdownSetting, props, [AppContainer, AdminMarkDownContainer]);
};

MarkdownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,

};

export default withTranslation()(MarkdownSettingWrapper);
