const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import React from 'react';\nimport React, { Component, ErrorInfo, ReactNode } from 'react';", "import React, { Component, ErrorInfo, ReactNode } from 'react';");

fs.writeFileSync('src/App.tsx', code);
