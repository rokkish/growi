import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '@growi/core';
import Config from '~/server/models/config';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:remove-layout-setting');

module.exports = {
  async up(db, client) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const layoutType = await Config.findOne({ key: 'customize:layout' });

    if (layoutType == null) {
      return;
    }

    const promise = [
      // remove layout
      Config.findOneAndDelete({ key: 'customize:layout' }),
    ];

    if (layoutType.value === '"kibela"') {
      promise.push(
        Config.update(
          { key: 'customize:theme' },
          { value: JSON.stringify('kibela') },
        ),
      );
    }

    await Promise.all(promise);

    logger.info('Migration has successfully applied');
  },

  async down(db, client) {
    logger.info('Rollback migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const theme = await Config.findOne({ key: 'customize:theme' });
    const insertLayoutType = (theme.value === '"kibela"') ? 'kibela' : 'growi';

    const insertConfig = new Config({
      ns: 'crowi',
      key: 'customize:layout',
      value: JSON.stringify(insertLayoutType),
    });

    const promise = [
      insertConfig.save(),
      Config.update(
        { key: 'customize:theme', value: JSON.stringify('kibela') },
        { value: JSON.stringify('default') },
      ),
    ];

    await Promise.all(promise);

    logger.info('Migration has been successfully rollbacked');
  },
};
