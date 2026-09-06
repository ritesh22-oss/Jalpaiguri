const fs = require('fs');
let code = fs.readFileSync('src/components/dining/RestaurantDashboardView.tsx', 'utf8');

const oldNameBlock = `                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase truncate">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[#11241C] dark:text-white text-xs leading-snug line-clamp-2">
                      {language === 'bn' && item.nameBn ? item.nameBn : item.name}
                    </h4>`;

const newNameBlock = `                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase truncate">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[#11241C] dark:text-white text-xs leading-snug line-clamp-2">
                      {item.isVeg !== undefined && (
                        <span className={\`inline-block w-3 h-3 border rounded-sm mr-1.5 align-middle \${item.isVeg ? 'border-green-600' : (item.isEgg ? 'border-yellow-500' : 'border-red-600')}\`}>
                          <span className={\`block w-1.5 h-1.5 rounded-full mx-auto mt-[2px] \${item.isVeg ? 'bg-green-600' : (item.isEgg ? 'bg-yellow-500' : 'bg-red-600')}\`}></span>
                        </span>
                      )}
                      <span className="align-middle">{language === 'bn' && item.nameBn ? item.nameBn : item.name}</span>
                    </h4>`;

code = code.replace(oldNameBlock, newNameBlock);
fs.writeFileSync('src/components/dining/RestaurantDashboardView.tsx', code);
