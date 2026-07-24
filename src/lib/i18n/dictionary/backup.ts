export const backupText = {
  backup_label: { english: 'Backup', sinhala: 'උපස්ථය', mixed: 'Backup' },
  backup_description: {
    english:
      'Downloads everything — all vehicle, customer, finance and document data as JSON, plus every uploaded photo/document — as one zip file to save on your computer. This may take a while depending on how many files you have.',
    sinhala:
      'වාහන, පාරිභෝගික, මූල්‍ය සහ ලේඛන දත්ත සියල්ල JSON ලෙසත්, උඩුගත කළ සියලුම ඡායාරූප/ලේඛන ද zip file එකක් ලෙස ඔබේ පරිගණකයට download කරයි.',
    mixed:
      'Vehicle, customer, finance සහ document data සියල්ල JSON ලෙසත්, upload කළ photos/documents ද එකතු කරලා එක zip file එකක් download කරයි.',
  },
  download_backup: { english: 'Download Backup', sinhala: 'උපස්ථය Download කරන්න', mixed: 'Backup Download කරන්න' },
  backup_preparing: { english: 'Preparing...', sinhala: 'සූදානම් වෙමින්...', mixed: 'Preparing...' },
  backup_zipping: { english: 'Packing files...', sinhala: 'Files ඇසුරුම් කරමින්...', mixed: 'Files pack කරමින්...' },
  backup_downloading_files: { english: 'Downloading files', sinhala: 'Files download කරමින්', mixed: 'Files download කරමින්' },
  backup_done: { english: 'Backup downloaded.', sinhala: 'උපස්ථය download විය.', mixed: 'Backup download වුණා.' },
  backup_failed: {
    english: 'Backup failed. Please try again.',
    sinhala: 'උපස්ථය අසාර්ථක විය. නැවත උත්සාහ කරන්න.',
    mixed: 'Backup fail වුණා. නැවත උත්සාහ කරන්න.',
  },
} as const;
