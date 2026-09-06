const fs = require('fs');
let code = fs.readFileSync('src/components/dining/RestaurantDetailView.tsx', 'utf8');

const itemTemplate = `
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {menuItem.isVeg !== undefined && (
                            <span className={\`inline-block w-3 h-3 border rounded-sm mr-1.5 \${menuItem.isVeg ? 'border-green-600' : (menuItem.isEgg ? 'border-yellow-500' : 'border-red-600')}\`}>
                              <span className={\`block w-1.5 h-1.5 rounded-full mx-auto mt-[2px] \${menuItem.isVeg ? 'bg-green-600' : (menuItem.isEgg ? 'bg-yellow-500' : 'bg-red-600')}\`}></span>
                            </span>
                          )}
                          <h4 className="font-bold text-sm text-[#11241C] dark:text-white inline-block">
                            {language === 'bn' && menuItem.nameBn ? menuItem.nameBn : menuItem.name}
                          </h4>
                        </div>
`;

code = code.replace(/<div className="flex-1">[\s\S]*?<h4 className="font-bold text-sm text-\[#11241C\] dark:text-white">[\s\S]*?\{language === 'bn' && menuItem\.nameBn \? menuItem\.nameBn : menuItem\.name\}[\s\S]*?<\/h4>/, itemTemplate);

fs.writeFileSync('src/components/dining/RestaurantDetailView.tsx', code);
