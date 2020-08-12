import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import RecentChangesIcon from './Icons/RecentChangesIcon';
import AttachmentIcon from './Icons/AttachmentIcon';

import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {
  const { pageAccessoriesContainer } = props;

  function renderModal() {
    return (
      <>
        <PageAccessoriesModal
          isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
          onClose={pageAccessoriesContainer.closePageAccessoriesModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="top-of-table-contents d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0" onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('pagelist')}>
          <PageListIcon />
        </button>

        <button type="button" className="bg-transparent border-0 active" onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('timeline')}>
          <TimeLineIcon />
        </button>

        <button type="button" className="bg-transparent border-0" onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('recent-changes')}>
          <RecentChangesIcon />
        </button>

        <button type="button" className="bg-transparent border-0" onClick={() => pageAccessoriesContainer.openPageAccessoriesModal('attachment')}>
          <AttachmentIcon />
        </button>
        {/* [TODO: setting Footprints' icon by GW-3308] */}
        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
        >
        </div>
      </div>
      {renderModal()}
    </>
  );
};
/**
 * Wrapper component for using unstated
 */
const TopOfTableContentsWrapper = withUnstatedContainers(TopOfTableContents, [PageAccessoriesContainer]);

TopOfTableContents.propTypes = {
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
};

export default withTranslation()(TopOfTableContentsWrapper);
