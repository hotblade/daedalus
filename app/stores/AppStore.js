// @flow
import { observable, action, computed } from 'mobx';
import Store from './lib/Store';
import CachedRequest from './lib/CachedRequest';
import globalMessages from '../i18n/global-messages';

export default class AppStore extends Store {

  LANGUAGE_OPTIONS = [
    { value: 'en-US', label: globalMessages.languageEnglish },
    { value: 'ja-JP', label: globalMessages.languageJapanese },
    { value: 'zh-CN', label: globalMessages.languageChinese },
    { value: 'ko-KR', label: globalMessages.languageKorean },
    { value: 'de-DE', label: globalMessages.languageGerman },
    { value: 'hr-HR', label: globalMessages.languageCroatian },
  ];

  @observable profileLocaleRequest = new CachedRequest(this.api, 'setUserLocale');

  setup() {
    this.actions.router.goToRoute.listen(this._updateRouteLocation);
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.registerReactions([
      this._redirectToMainUiAfterLocaleIsSet,
      this._redirectToLanguageSelectionIfNoLocaleSet
    ]);
  }

  @computed get currentRoute(): string {
    return this.stores.router.location.pathname;
  }

  @computed get currentLocale(): string {
    if (!this.isCurrentLocaleSet) {
      return 'en-US';
    }
    return this.profileLocaleRequest.result;
  }

  @computed get isCurrentLocaleSet(): bool {
    return this.profileLocaleRequest.wasExecuted;
  }

  _redirectToLanguageSelectionIfNoLocaleSet = () => {
    if (!this.isCurrentLocaleSet) {
      this.actions.router.goToRoute({ route: '/profile/language-selection' });
    }
  };

  @action _updateLocale = ({ locale }: { locale: string }) => {
    this.profileLocaleRequest.execute(locale);
  };

  _updateRouteLocation = ({ route }: { route: string }) => {
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== route) this.stores.router.push(route);
  };

  _redirectToMainUiAfterLocaleIsSet = () => {
    if (this.isCurrentLocaleSet && this.stores.app.currentRoute === '/profile/language-selection') {
      this.actions.router.goToRoute({ route: '/' });
    }
  };

}
