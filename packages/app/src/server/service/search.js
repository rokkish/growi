import loggerFactory from '~/utils/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:service:search');
const xss = require('xss');

// options for filtering xss
const filterXssOptions = {
  whiteList: {
    em: ['class'],
  },
};

const filterXss = new xss.FilterXSS(filterXssOptions);

class SearchService {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    this.isErrorOccuredOnHealthcheck = null;
    this.isErrorOccuredOnSearching = null;

    try {
      this.delegator = this.generateDelegator();
    }
    catch (err) {
      logger.error(err);
    }

    if (this.isConfigured) {
      this.delegator.init();
      this.registerUpdateEvent();
    }
  }

  get isConfigured() {
    return this.delegator != null;
  }

  get isReachable() {
    return this.isConfigured && !this.isErrorOccuredOnHealthcheck && !this.isErrorOccuredOnSearching;
  }

  get isSearchboxEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:searchboxSslUrl');
    return uri != null && uri.length > 0;
  }

  get isElasticsearchEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');
    return uri != null && uri.length > 0;
  }

  generateDelegator() {
    logger.info('Initializing search delegator');

    if (this.isSearchboxEnabled) {
      const SearchboxDelegator = require('./search-delegator/searchbox');
      logger.info('Searchbox is enabled');
      return new SearchboxDelegator(this.configManager, this.crowi.socketIoService);
    }
    if (this.isElasticsearchEnabled) {
      const ElasticsearchDelegator = require('./search-delegator/elasticsearch');
      logger.info('Elasticsearch (not Searchbox) is enabled');
      return new ElasticsearchDelegator(this.configManager, this.crowi.socketIoService);
    }

    logger.info('No elasticsearch URI is specified so that full text search is disabled.');
  }

  registerUpdateEvent() {
    const pageEvent = this.crowi.event('page');
    pageEvent.on('create', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('update', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('deleteCompletely', this.delegator.syncPagesDeletedCompletely.bind(this.delegator));
    pageEvent.on('delete', this.delegator.syncPageDeleted.bind(this.delegator));
    pageEvent.on('updateMany', this.delegator.syncPagesUpdated.bind(this.delegator));
    pageEvent.on('syncDescendants', this.delegator.syncDescendantsPagesUpdated.bind(this.delegator));
    pageEvent.on('addSeenUsers', this.delegator.syncPageUpdated.bind(this.delegator));

    const bookmarkEvent = this.crowi.event('bookmark');
    bookmarkEvent.on('create', this.delegator.syncBookmarkChanged.bind(this.delegator));
    bookmarkEvent.on('delete', this.delegator.syncBookmarkChanged.bind(this.delegator));

    const tagEvent = this.crowi.event('tag');
    tagEvent.on('update', this.delegator.syncTagChanged.bind(this.delegator));
  }

  resetErrorStatus() {
    this.isErrorOccuredOnHealthcheck = false;
    this.isErrorOccuredOnSearching = false;
  }

  async reconnectClient() {
    logger.info('Try to reconnect...');
    this.delegator.initClient();

    try {
      await this.getInfoForHealth();

      logger.info('Reconnecting succeeded.');
      this.resetErrorStatus();
    }
    catch (err) {
      throw err;
    }
  }

  async getInfo() {
    try {
      return await this.delegator.getInfo();
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getInfoForHealth() {
    try {
      const result = await this.delegator.getInfoForHealth();

      this.isErrorOccuredOnHealthcheck = false;
      return result;
    }
    catch (err) {
      logger.error(err);

      // switch error flag, `isErrorOccuredOnHealthcheck` to be `false`
      this.isErrorOccuredOnHealthcheck = true;
      throw err;
    }
  }

  async getInfoForAdmin() {
    return this.delegator.getInfoForAdmin();
  }

  async normalizeIndices() {
    return this.delegator.normalizeIndices();
  }

  async rebuildIndex() {
    return this.delegator.rebuildIndex();
  }

  async searchKeyword(keyword, user, userGroups, searchOpts) {
    try {
      return await this.delegator.searchKeyword(keyword, user, userGroups, searchOpts);
    }
    catch (err) {
      logger.error(err);

      // switch error flag, `isReachable` to be `false`
      this.isErrorOccuredOnSearching = true;
      throw err;
    }
  }

  /**
   * formatting result
   */
  formatResult(esResult) {
    esResult.data.forEach((data) => {
      const highlightData = data._highlight;
      const snippet = highlightData['body.en'] || highlightData['body.ja'] || '';
      const pathMatch = highlightData['path.en'] || highlightData['path.ja'] || '';

      data.elasticSearchResult = {
        snippet: filterXss.process(snippet),
        highlightedPath: filterXss.process(pathMatch),
      };
    });
    return esResult;
  }

}

module.exports = SearchService;
