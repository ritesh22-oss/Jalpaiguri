const fs = require('fs');

// 1. Fix App.tsx duplicate React import
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("import React from 'react';\nimport React, { Component, ErrorInfo, ReactNode } from 'react';", "import React, { Component, ErrorInfo, ReactNode } from 'react';");
fs.writeFileSync('src/App.tsx', appCode);

// 2. Fix TransportView.tsx coordinates
let transportCode = fs.readFileSync('src/components/transport/TransportView.tsx', 'utf8');
transportCode = transportCode.replace("const { location, coordinates } = useLocation();", "const { location } = useLocation();");
fs.writeFileSync('src/components/transport/TransportView.tsx', transportCode);

// 3. Fix HomeView.tsx missing icon imports
let homeCode = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');
if (!homeCode.includes('Bus, Package, GraduationCap')) {
  homeCode = homeCode.replace("import {", "import {\n  Bus, Package, GraduationCap,");
}
fs.writeFileSync('src/components/views/HomeView.tsx', homeCode);

console.log('Fixed lint issues successfully.');
