export type Locale = 'en' | 'de';

// Change `locale` here to set the app's default language.
// A UI to change this at runtime can read/write via useLocale() from LanguageContext.
export const languageConfig: { locale: Locale } = {
  locale: 'de',
};

export interface Translations {
  // Navigation titles
  nav_boxes: string;
  nav_editBox: string;
  nav_newBox: string;
  nav_editItem: string;
  nav_newItem: string;

  // HomeScreen
  home_crumb: string;
  home_searchPlaceholder: string;
  home_includeBoxes: string;
  home_noResults: string;
  home_newBox: string;
  home_newItem: string;
  home_badgeBox: string;
  home_badgeItem: string;

  // Shared
  perm_openSettings: string;

  // AddEditBoxScreen
  box_permissionTitle: string;
  box_permissionMessage: string;
  box_nameRequiredTitle: string;
  box_nameRequiredMessage: string;
  box_nameLabel: string;
  box_namePlaceholder: string;
  box_descriptionLabel: string;
  box_descriptionPlaceholder: string;
  box_imageLabel: string;
  box_changePhoto: string;
  box_tapToAddPhoto: string;
  box_categoryLabel: string;
  box_newCategory: string;
  box_categoryNamePlaceholder: string;
  box_colorLabel: string;
  box_saving: string;
  box_save: string;
  box_cancel: string;

  // AddEditItemScreen
  item_permissionTitle: string;
  item_permissionMessage: string;
  item_nameLabel: string;
  item_namePlaceholder: string;
  item_nameRequired: string;
  item_descriptionLabel: string;
  item_descriptionPlaceholder: string;
  item_amountLabel: string;
  item_amountError: string;
  item_photoLabel: string;
  item_removePhoto: string;
  item_addPhoto: string;
  item_boxLabel: string;
  item_boxSearchPlaceholder: string;
  item_boxIn: string;
  item_boxRequired: string;
  item_save: string;
  item_cancel: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav_boxes: 'Boxes',
    nav_editBox: 'Edit Box',
    nav_newBox: 'New Box',
    nav_editItem: 'Edit Item',
    nav_newItem: 'New Item',

    home_crumb: 'Inventory',
    home_searchPlaceholder: 'Search items and boxes…',
    home_includeBoxes: 'Include boxes in search',
    home_noResults: 'No results',
    home_newBox: '+ New Box',
    home_newItem: '+ New Item',
    home_badgeBox: 'Box',
    home_badgeItem: 'Item',

    perm_openSettings: 'Open Settings',

    box_permissionTitle: 'Permission needed',
    box_permissionMessage: 'Allow photo access to attach an image.',
    box_nameRequiredTitle: 'Name required',
    box_nameRequiredMessage: 'Please enter a name for the box.',
    box_nameLabel: 'Name',
    box_namePlaceholder: 'e.g. Green Plastic Box 1',
    box_descriptionLabel: 'Description',
    box_descriptionPlaceholder: 'Optional details…',
    box_imageLabel: 'Image',
    box_changePhoto: 'Change photo',
    box_tapToAddPhoto: 'Tap to add photo',
    box_categoryLabel: 'Category',
    box_newCategory: '+ New',
    box_categoryNamePlaceholder: 'Category name',
    box_colorLabel: 'Color',
    box_saving: 'Saving…',
    box_save: 'Save Box',
    box_cancel: 'Cancel',

    item_permissionTitle: 'Permission needed',
    item_permissionMessage: 'Allow access to your photo library to add a photo.',
    item_nameLabel: 'Name *',
    item_namePlaceholder: 'e.g. Wood screws M4×20',
    item_nameRequired: 'Name is required.',
    item_descriptionLabel: 'Description',
    item_descriptionPlaceholder: 'Any extra detail…',
    item_amountLabel: 'Amount *',
    item_amountError: 'Amount must be a positive number.',
    item_photoLabel: 'Photo',
    item_removePhoto: 'Remove',
    item_addPhoto: 'Add Photo',
    item_boxLabel: 'Box *',
    item_boxSearchPlaceholder: 'Tap to see recent boxes or search…',
    item_boxIn: 'In',
    item_boxRequired: 'A box is required.',
    item_save: 'Save',
    item_cancel: 'Cancel',
  },

  de: {
    nav_boxes: 'Boxen',
    nav_editBox: 'Box bearbeiten',
    nav_newBox: 'Neue Box',
    nav_editItem: 'Artikel bearbeiten',
    nav_newItem: 'Neuer Artikel',

    home_crumb: 'Inventar',
    home_searchPlaceholder: 'Artikel und Boxen suchen…',
    home_includeBoxes: 'Boxen in Suche einbeziehen',
    home_noResults: 'Keine Ergebnisse',
    home_newBox: '+ Neue Box',
    home_newItem: '+ Neuer Artikel',
    home_badgeBox: 'Box',
    home_badgeItem: 'Artikel',

    perm_openSettings: 'Einstellungen öffnen',

    box_permissionTitle: 'Zugriff benötigt',
    box_permissionMessage: 'Bitte Fotobibliothek-Zugriff erlauben, um ein Bild hinzuzufügen.',
    box_nameRequiredTitle: 'Name erforderlich',
    box_nameRequiredMessage: 'Bitte einen Namen für die Box eingeben.',
    box_nameLabel: 'Name',
    box_namePlaceholder: 'z. B. Grüne Plastikbox 1',
    box_descriptionLabel: 'Beschreibung',
    box_descriptionPlaceholder: 'Optionale Details…',
    box_imageLabel: 'Bild',
    box_changePhoto: 'Foto ändern',
    box_tapToAddPhoto: 'Tippen, um Foto hinzuzufügen',
    box_categoryLabel: 'Kategorie',
    box_newCategory: '+ Neu',
    box_categoryNamePlaceholder: 'Kategoriename',
    box_colorLabel: 'Farbe',
    box_saving: 'Speichern…',
    box_save: 'Box speichern',
    box_cancel: 'Abbrechen',

    item_permissionTitle: 'Zugriff benötigt',
    item_permissionMessage: 'Bitte Fotobibliothek-Zugriff erlauben, um ein Foto hinzuzufügen.',
    item_nameLabel: 'Name *',
    item_namePlaceholder: 'z. B. Holzschrauben M4×20',
    item_nameRequired: 'Name ist erforderlich.',
    item_descriptionLabel: 'Beschreibung',
    item_descriptionPlaceholder: 'Weitere Details…',
    item_amountLabel: 'Anzahl *',
    item_amountError: 'Anzahl muss eine positive Zahl sein.',
    item_photoLabel: 'Foto',
    item_removePhoto: 'Entfernen',
    item_addPhoto: 'Foto hinzufügen',
    item_boxLabel: 'Box *',
    item_boxSearchPlaceholder: 'Tippen, um aktuelle Boxen zu sehen oder zu suchen…',
    item_boxIn: 'In',
    item_boxRequired: 'Eine Box ist erforderlich.',
    item_save: 'Speichern',
    item_cancel: 'Abbrechen',
  },
};
