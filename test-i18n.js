const { I18n } = require('./dist/structures/I18n');
const { Logger } = require('./dist/utils/logger/Logger');
const path = require('path');

const logger = new Logger();
const i18n = new I18n('en-US', logger);

(async () => {
    console.log('Loading locales...');
    await i18n.loadLocales(path.join(__dirname, 'locales'));

    console.log('Testing translations:');
    console.log('hello:', i18n.t('en-US', 'hello'));
    console.log('greeting:', i18n.t('en-US', 'greeting', { user: 'Developer' }));
    console.log('nested:', i18n.t('en-US', 'commands.ping.desc'));
    console.log('fallback:', i18n.t('tr-TR', 'hello')); // Should fallback to en-US
})();
