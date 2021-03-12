import {
  VFC, useState, useEffect, useCallback,
} from 'react';

import { PaginationWrapper } from '~/components/PaginationWrapper';


import PageAttachmentList from '../../client/js/components/PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from '../../client/js/components/PageAttachment/DeleteAttachmentModal';
import { useCurrentPageAttachment, useCurrentPageSWR } from '~/stores/page';
import { Attachment } from '~/interfaces/page';
import { useTranslation } from '~/i18n';

export const PageAttachment:VFC = () => {
  const { t } = useTranslation();

  const [inUse, setInUse] = useState<{ [key:string]:boolean }>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment>();

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  const { data: currentPage } = useCurrentPageSWR();
  const { data: paginationResult } = useCurrentPageAttachment(activePage);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);
    setAttachments(paginationResult.docs);
  }, [paginationResult]);

  const checkIfFileInUse = useCallback((attachment) => {

    if (currentPage?.revision.body.match(attachment._id)) {
      return true;
    }
    return false;
  }, [currentPage]);

  useEffect(() => {
    const inUse: { [key:string]:boolean } = {};
    for (const attachment of attachments) {
      inUse[attachment._id] = checkIfFileInUse(attachment);
    }
    setInUse(inUse);
  }, [attachments, checkIfFileInUse]);

  const onAttachmentDeleteClicked = useCallback((attachment:Attachment) => {
    setAttachmentToDelete(attachment);
  }, []);

  if (paginationResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="mt-2">
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <>
      <PageAttachmentList
        attachments={attachments}
        inUse={inUse}
        onAttachmentDeleteClicked={onAttachmentDeleteClicked}
      />
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
      {/* <DeleteAttachmentModal
        isOpen={showModal}
        animation="false"
        toggle={deleteModalClose}

        attachmentToDelete={attachmentToDelete}
        inUse={deleteInUse}
        deleting={this.state.deleting}
        deleteError={this.state.deleteError}
        onAttachmentDeleteClickedConfirm={this.onAttachmentDeleteClickedConfirm}
      /> */}
    </>
  );

};


//   onAttachmentDeleteClickedConfirm(attachment) {
//     const attachmentId = attachment._id;
//     this.setState({
//       deleting: true,
//     });

//     apiPost('/attachments.remove', { attachment_id: attachmentId })
//       .then((res) => {
//         this.setState({
//           attachments: this.state.attachments.filter((at) => {
//             // comparing ObjectId
//             // eslint-disable-next-line eqeqeq
//             return at._id != attachmentId;
//           }),
//           attachmentToDelete: null,
//           deleting: false,
//         });
//       }).catch((err) => {
//         this.setState({
//           deleteError: 'Something went wrong.',
//           deleting: false,
//         });
//       });
//   }

//   isUserLoggedIn() {
//     // TODO retrieve from useCurrentUser at context.tsx
//     const currentUser = null;
//     return currentUser != null;
//   }


//   render() {
//     const { t } = this.props;
//     if (this.state.attachments.length === 0) {
//       return t('No_attachments_yet');
//     }

//     let deleteAttachmentModal = '';
//     if (this.isUserLoggedIn()) {
//       const attachmentToDelete = this.state.attachmentToDelete;
//       const deleteModalClose = () => {
//         this.setState({ attachmentToDelete: null, deleteError: '' });
//       };
//       const showModal = attachmentToDelete !== null;

//       let deleteInUse = null;
//       if (attachmentToDelete !== null) {
//         deleteInUse = this.state.inUse[attachmentToDelete._id] || false;
//       }

//       deleteAttachmentModal = (
//         <DeleteAttachmentModal
//           isOpen={showModal}
//           animation="false"
//           toggle={deleteModalClose}

//           attachmentToDelete={attachmentToDelete}
//           inUse={deleteInUse}
//           deleting={this.state.deleting}
//           deleteError={this.state.deleteError}
//           onAttachmentDeleteClickedConfirm={this.onAttachmentDeleteClickedConfirm}
//         />
//       );
//     }

//     return (
//       <>
//         {deleteAttachmentModal}
//       </>
//     );
//   }

// }
