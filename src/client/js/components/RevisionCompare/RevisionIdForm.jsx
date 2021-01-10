import React from 'react';
import AsyncSelect from 'react-select/async';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionCompareContainer from '../../services/RevisionCompareContainer';

class RevisionIdForm extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
    };

    this.loadFilteredRevisionOptions = this.loadFilteredRevisionOptions.bind(this);
  }

  revisionOptions() {
    const { revisionCompareContainer } = this.props;
    return revisionCompareContainer.state.revisions.map(rev => {
      return { label: `${new Date(rev.createdAt)} - ${rev._id}`, value: rev._id };
    });
  }

  async loadFilteredRevisionOptions(inputText, callback) {
    // Filter the RevisionId that matches the text user entered.
    const revisionOptions = this.revisionOptions();
    const filteredRevisionOptions = revisionOptions.filter(rev => rev.label.toLowerCase().includes(inputText.toLowerCase()));
    callback(filteredRevisionOptions);
  }

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {label} label text of inputbox
   */
  renderRevisionSelector(label, inputText) {
    if (["FromRev", "ToRev"].indexOf(label) === -1) {
      return <div></div>
    }
    const forFromRev = (label === "FromRev");

    const { revisionCompareContainer } = this.props;
    const changeHandler = (forFromRev ? revisionCompareContainer.handleFromRevisionChange : revisionCompareContainer.handleToRevisionChange);
    const rev = (forFromRev ? revisionCompareContainer.state.fromRevision?._id : revisionCompareContainer.state.toRevision?._id );
    return (
      <AsyncSelect
        cacheOptions
        loadOptions={this.loadFilteredRevisionOptions}
        defaultOptions={this.revisionOptions()}
        onChange={(selectedOption) => changeHandler(selectedOption.value)}
        placeholder={label}
        options={[rev]}
      />
    );
  }

  render() {
    const fromRevSelector = this.renderRevisionSelector("FromRev");
    const toRevSelector = this.renderRevisionSelector("ToRev");

    return (
      <div className="container-fluid px-0">
        <div className="row">
          <div className="mb-3 col-sm">
            { fromRevSelector }
          </div>
          <div className="mb-3 col-sm">
            { toRevSelector }
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RevisionIdFormWrapper = withUnstatedContainers(RevisionIdForm, [RevisionCompareContainer]);

/**
 * Properties
 */
RevisionIdForm.propTypes = {
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

/**
 * Properties
 */
RevisionIdForm.defaultProps = {
};

export default RevisionIdFormWrapper;
