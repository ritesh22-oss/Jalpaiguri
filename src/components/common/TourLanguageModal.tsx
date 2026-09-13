import React from 'react';

// TourLanguageModal has been removed per specification:
// Existing/already registered users bypass the tour entirely, and new users transition
// directly into the integrated AppTour on HomeView without a blocking pre-tour dialog.
export const TourLanguageModal: React.FC = () => {
  return null;
};

