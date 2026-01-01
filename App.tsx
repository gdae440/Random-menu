
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ChefHat, 
  Search, 
  RefreshCw, 
  X, 
  Loader2, 
  Sparkles, 
  UtensilsCrossed,
  Compass,
  ChevronRight,
  Beef,
  Flame,
  Egg,
  Drumstick,
  Plus,
  Trash2,
  Check,
  Settings,
  Key,
  Wand2,
  BookOpen,
  AlertCircle // Imported for the delete confirmation modal
} from 'lucide-react';
import { RECIPES as STATIC_RECIPES } from './data';
import { Recipe, AppMode } from './types';
import { fetchCookingInstructions, exploreAiKitchen } from './services/aiService';
import Typewriter from './components/Typewriter';

const App: React.FC = () => {
  // Local storage keys
  const STORAGE_KEY_RECIPES = 'user_recipes_v2';
  const STORAGE_KEY_API = 'deepseek_official_key';

  // State
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem(STORAGE_KEY_API) || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showRecipeList, setShowRecipeList] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  
  // Custom Delete Confirmation State
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  
  const [userRecipes, setUserRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECIPES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load recipes", e);
      return [];
    }
  });

  const [mode, setMode] = useState<AppMode>(AppMode.RANDOM);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  
  // Explore State
  const [exploreInput, setExploreInput] = useState('');
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreResults, setExploreResults] = useState<string[]>([]);
  
  // AI Content State
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form State for new recipe
  const [newName, setNewName] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newCategory, setNewCategory] = useState('素菜/蛋/主食');

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(userRecipes));
  }, [userRecipes]);

  // Combined List (Static + Custom)
  const allRecipes = useMemo(() => {
    return [...STATIC_RECIPES, ...userRecipes];
  }, [userRecipes]);

  // Grouping for Recipe Manager
  const categorizedRecipes = useMemo(() => {
    return allRecipes.reduce((acc, recipe) => {
      if (!acc[recipe.category]) acc[recipe.category] = [];
      acc[recipe.category].push(recipe);
      return acc;
    }, {} as Record<string, Recipe[]>);
  }, [allRecipes]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('牛肉')) return <Beef className="text-red-500" size={18} />;
    if (category.includes('猪肉')) return <Flame className="text-orange-500" size={18} />;
    if (category.includes('鸡肉')) return <Drumstick className="text-amber-500" size={18} />;
    if (category.includes('AI')) return <Sparkles className="text-purple-500" size={18} />;
    return <Egg className="text-yellow-500" size={18} />;
  };

  const handleRandomize = useCallback(() => {
    if (isSpinning || allRecipes.length === 0) return;
    setIsSpinning(true);
    setAiContent(null);
    setAiError(null);
    let counter = 0;
    const totalTicks = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allRecipes.length);
      setSelectedRecipe(allRecipes[randomIndex]);
      counter++;
      if (counter >= totalTicks) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  }, [isSpinning, allRecipes]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredRecipes([]);
      return;
    }
    const keywords = searchQuery.toLowerCase().split(/\s+/);
    const results = allRecipes.filter(recipe => {
      const recipeContent = [recipe.name, ...recipe.ingredients].join(' ').toLowerCase();
      return keywords.every(kw => recipeContent.includes(kw));
    });
    setFilteredRecipes(results);
    setSelectedRecipe(null);
    setAiContent(null);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setAiContent(null);
    setAiError(null);
    setShowRecipeList(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetAiHelp = async () => {
    if (!selectedRecipe) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const result = await fetchCookingInstructions(selectedRecipe.name, apiKey);
      setAiContent(result);
    } catch (err: any) {
      setAiError(err.message || '获取 AI 指导失败，请检查网络或 API Key');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplore = async () => {
    if (!exploreInput.trim()) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    
    setExploreLoading(true);
    setExploreResults([]);
    setAiContent(null);
    setAiError(null);
    setSelectedRecipe(null); 

    try {
        const result = await exploreAiKitchen(exploreInput, apiKey);
        
        if (result.type === 'list') {
            setExploreResults(result.items || []);
        } else if (result.type === 'instruction') {
            setAiContent(result.content);
        }
    } catch (err: any) {
        setAiError(err.message || 'AI 探索失败，请稍后重试');
    } finally {
        setExploreLoading(false);
    }
  };

  const handleAddAiRecommendedRecipe = (recipeName: string) => {
      const existing = userRecipes.find(r => r.name === recipeName);
      if (existing) {
          handleRecipeSelect(existing);
          return;
      }

      const newRecipe: Recipe = {
          id: 'ai-' + Date.now() + Math.random().toString(36).substr(2, 9),
          name: recipeName,
          ingredients: ['AI推荐', ...exploreInput.split(' ')],
          category: 'AI 灵感',
          isCustom: true
      };
      
      setUserRecipes(prev => [newRecipe, ...prev]);
      handleRecipeSelect(newRecipe);
  };

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newRecipe: Recipe = {
      id: 'user-' + Date.now() + Math.random().toString(36).substr(2, 9),
      name: newName,
      ingredients: newIngredients.split(/[，, ]+/).filter(i => i.trim()),
      category: newCategory,
      isCustom: true
    };
    setUserRecipes(prev => [newRecipe, ...prev]);
    setNewName('');
    setNewIngredients('');
    setShowAddRecipe(false);
  };

  // Handler to open the custom confirmation modal
  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRecipeToDelete(id);
  };

  // Actual deletion logic
  const confirmDelete = () => {
    if (recipeToDelete) {
      setUserRecipes(prev => prev.filter(r => r.id !== recipeToDelete));
      
      // If the deleted recipe was currently selected/viewed, close it
      if (selectedRecipe?.id === recipeToDelete) {
        setSelectedRecipe(null);
        setAiContent(null);
      }
      setRecipeToDelete(null);
    }
  };

  const switchMode = (newMode: AppMode) => {
      setMode(newMode);
      setAiContent(null);
      setSelectedRecipe(null);
      setAiError(null);
      if (newMode === AppMode.EXPLORE) {
          setExploreResults([]);
      }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-orange-50 relative pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-orange-50/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
            <ChefHat className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-app text-orange-900 tracking-wider">今天吃什么</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowRecipeList(true)}
            className="p-2 text-orange-400 bg-orange-100 rounded-full hover:bg-orange-200 active:scale-95 transition-all"
            title="食谱大全"
          >
            <BookOpen size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 text-orange-400 bg-orange-100 rounded-full hover:bg-orange-200 active:scale-95 transition-all"
            title="设置"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex bg-orange-200/40 p-1 rounded-2xl mb-8 shadow-inner border border-orange-100">
          <button 
            onClick={() => switchMode(AppMode.RANDOM)}
            className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center gap-1 font-bold transition-all text-xs ${mode === AppMode.RANDOM ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/50'}`}
          >
            <RefreshCw size={18} />
            <span>随机</span>
          </button>
          <button 
            onClick={() => switchMode(AppMode.FILTER)}
            className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center gap-1 font-bold transition-all text-xs ${mode === AppMode.FILTER ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/50'}`}
          >
            <Search size={18} />
            <span>搜索</span>
          </button>
          <button 
            onClick={() => switchMode(AppMode.EXPLORE)}
            className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center gap-1 font-bold transition-all text-xs ${mode === AppMode.EXPLORE ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/50'}`}
          >
            <Compass size={18} />
            <span>AI 探索</span>
          </button>
        </div>

        {/* Selected Recipe View */}
        {selectedRecipe && mode !== AppMode.RANDOM && (
          <div className="bg-white rounded-3xl p-5 mb-6 shadow-xl shadow-orange-200/50 border-2 border-orange-400 relative animate-in fade-in slide-in-from-top-2">
            {selectedRecipe.isCustom && (
              <span className="absolute -top-3 -left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">私房菜</span>
            )}
            <div className="flex justify-between items-start mb-2">
               <h2 className="text-2xl font-bold text-orange-900 pr-8">{selectedRecipe.name}</h2>
               <div className="flex items-center gap-1">
                 {selectedRecipe.isCustom && (
                    <button 
                        onClick={(e) => promptDelete(e, selectedRecipe.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="删除"
                    >
                        <Trash2 size={20}/>
                    </button>
                 )}
                 <button onClick={() => setSelectedRecipe(null)} className="text-orange-300 p-2 hover:bg-orange-50 rounded-full transition-colors"><X size={24}/></button>
               </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRecipe.ingredients.map((ing, idx) => (
                <span key={idx} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Randomizer Mode */}
        {mode === AppMode.RANDOM && (
          <div className="flex flex-col items-center px-2">
            <div className={`w-full bg-white rounded-3xl p-8 mb-8 text-center shadow-xl shadow-orange-200/50 border-2 border-orange-100 transition-all ${isSpinning ? 'scale-[0.98] ring-4 ring-orange-200' : ''}`}>
              <div className="mb-4 text-orange-300">
                <UtensilsCrossed size={48} className="mx-auto opacity-20" />
              </div>
              <div className="min-h-[4rem] flex items-center justify-center">
                {selectedRecipe ? (
                  <h2 className="text-3xl font-bold text-orange-900 leading-tight">
                    {selectedRecipe.name}
                    {selectedRecipe.isCustom && <div className="text-[10px] text-orange-500 font-bold mt-1 tracking-widest">[ 私房推荐 ]</div>}
                  </h2>
                ) : (
                  <p className="text-orange-400 text-lg italic">想吃什么？点下方开始</p>
                )}
              </div>
              {selectedRecipe && !isSpinning && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <span key={idx} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleRandomize}
              disabled={isSpinning}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-orange-300 transition-all active:scale-[0.97] flex items-center justify-center gap-3 text-xl"
            >
              {isSpinning ? <Loader2 className="animate-spin" /> : <RefreshCw size={24} />}
              {isSpinning ? '正在挑选...' : '吃什么好呢？'}
            </button>
          </div>
        )}

        {/* Filter Mode */}
        {mode === AppMode.FILTER && (
          <div className="flex flex-col">
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索菜名或食材关键词..."
                className="w-full bg-white border-2 border-orange-100 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-orange-500 shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
            </div>
            <div className="space-y-4">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeSelect(recipe)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${selectedRecipe?.id === recipe.id ? 'bg-orange-100 border-orange-500' : 'bg-white border-orange-100 active:bg-orange-50'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-orange-900">{recipe.name}</span>
                        {recipe.isCustom && <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold">私房</span>}
                      </div>
                      <p className="text-xs text-orange-400 mt-1 truncate max-w-[200px]">{recipe.ingredients.join(', ')}</p>
                    </div>
                    <ChevronRight size={18} className="text-orange-200" />
                  </button>
                ))
              ) : searchQuery && <div className="text-center py-10 text-orange-300 italic">没有发现相关菜肴</div>}
            </div>
          </div>
        )}

        {/* Explore Mode (AI Kitchen) */}
        {mode === AppMode.EXPLORE && (
          <div className="flex flex-col pb-10">
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-200 mb-6">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="text-yellow-300" />
                      AI 灵感厨房
                  </h2>
                  <p className="text-orange-100 text-sm mb-4 opacity-90">
                      输入冰箱里的食材（如“土豆 牛肉”），AI 为您推荐菜单；或者输入想吃的菜名，直接获取做法。
                  </p>
                  <div className="relative">
                      <input 
                        type="text" 
                        value={exploreInput}
                        onChange={(e) => setExploreInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                        placeholder="输入食材或菜名..."
                        className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl py-3 pl-4 pr-12 text-white placeholder-orange-100 focus:outline-none focus:bg-white/30 transition-all"
                      />
                      <button 
                        onClick={handleExplore}
                        disabled={exploreLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-orange-500 rounded-lg shadow-sm active:scale-90 transition-all disabled:opacity-50"
                      >
                         {exploreLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                      </button>
                  </div>
              </div>

              {/* Recommendation Results */}
              {exploreResults.length > 0 && !selectedRecipe && !aiContent && (
                  <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                      <h3 className="font-bold text-orange-900 mb-3 px-2 flex items-center gap-2">
                          <ChefHat size={18} />
                          为您推荐
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                          {exploreResults.map((dishName, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAddAiRecommendedRecipe(dishName)}
                                className="bg-white p-4 rounded-2xl border-2 border-orange-100 shadow-sm text-left flex justify-between items-center active:scale-[0.98] transition-all hover:border-orange-300"
                              >
                                  <span className="font-bold text-orange-800">{dishName}</span>
                                  <div className="flex items-center gap-2 text-xs text-orange-400 font-bold bg-orange-50 px-2 py-1 rounded-lg">
                                      <Plus size={12} />
                                      加入并查看
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
        )}

        {/* AI Chef Result Card (Used for both selected recipe and direct explore result) */}
        {(selectedRecipe || aiContent) && !isSpinning && (
          <div className="mt-4 mb-10 px-1 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Show "Teach Me" button ONLY if we have a selected recipe but no content yet */}
            {selectedRecipe && !aiContent && !isAiLoading && (
              <button
                onClick={handleGetAiHelp}
                className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
              >
                <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
                DeepSeek 教我做 (一人份)
              </button>
            )}

            {isAiLoading && (
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-orange-600 border-2 border-orange-100 shadow-inner">
                <div className="relative">
                   <Loader2 className="animate-spin text-orange-500" size={40} />
                   <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" size={16} />
                </div>
                <p className="font-bold mt-4 text-center">AI 大厨正在精确计算配料...</p>
              </div>
            )}

            {aiError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center text-sm shadow-sm">
                <p className="font-bold mb-1">哎呀，出错了</p>
                <p className="text-xs opacity-80 mb-2">{aiError}</p>
                <button onClick={mode === AppMode.EXPLORE ? handleExplore : handleGetAiHelp} className="font-bold underline">点此重试</button>
              </div>
            )}

            {aiContent && (
              <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
                <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold border-b border-orange-50 pb-2">
                  <Sparkles size={16} className="text-yellow-500" />
                  DeepSeek 烹饪指导 (一人份)
                </div>
                {/* If it's a direct exploration result (no selectedRecipe), show the input title */}
                {!selectedRecipe && exploreInput && (
                    <h3 className="text-xl font-bold text-orange-900 mb-3">{exploreInput}</h3>
                )}
                <div className="text-orange-900 text-sm md:text-base leading-relaxed relative z-10">
                  <Typewriter text={aiContent} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for Add Recipe */}
      <button 
        onClick={() => setShowAddRecipe(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-50 border-4 border-white"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Recipe List Manager Modal */}
      {showRecipeList && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-orange-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                    <BookOpen size={20} />
                    食谱大全 ({allRecipes.length})
                  </h3>
                  <button onClick={() => setShowRecipeList(false)} className="text-orange-300 p-2"><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 space-y-6">
                    {Object.entries(categorizedRecipes).map(([category, items]) => (
                        <section key={category}>
                            <div className="flex items-center gap-2 mb-3">
                                {getCategoryIcon(category)}
                                <h4 className="font-bold text-orange-900">{category}</h4>
                                <div className="flex-1 h-[1px] bg-orange-100"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(items as Recipe[]).map(recipe => (
                                    <div 
                                      key={recipe.id}
                                      className="flex items-center justify-between rounded-xl border border-orange-100 bg-white overflow-hidden transition-colors group shadow-sm"
                                    >
                                        {/* Clickable Info Area */}
                                        <div 
                                            onClick={() => handleRecipeSelect(recipe)}
                                            className="flex-1 p-3 cursor-pointer hover:bg-orange-50 active:bg-orange-100 transition-colors"
                                        >
                                            <div className="font-bold text-orange-800 flex items-center gap-2">
                                                {recipe.name}
                                                {recipe.isCustom && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded">私房</span>}
                                            </div>
                                            <div className="text-xs text-orange-300 truncate max-w-[180px]">
                                                {recipe.ingredients.join(' ')}
                                            </div>
                                        </div>

                                        {/* Separator line */}
                                        <div className="w-[1px] h-8 bg-orange-50"></div>

                                        {/* Delete Button Area - Explicitly styled for touch targets */}
                                        {recipe.isCustom ? (
                                            <button 
                                              type="button"
                                              onClick={(e) => promptDelete(e, recipe.id)}
                                              className="h-full px-4 text-orange-300 hover:text-red-500 active:bg-red-50 active:text-red-600 transition-colors flex items-center justify-center relative z-10"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        ) : (
                                            <div className="px-4 text-orange-100 flex items-center justify-center">
                                                <ChevronRight size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces window.confirm) */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 border-4 border-white">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除？</h3>
              <p className="text-gray-500 text-sm mb-6">
                删除后这道私房菜将无法恢复。
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setRecipeToDelete(null)}
                  className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-200"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (DeepSeek API Key) */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-orange-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                <Key size={20} />
                AI 设置
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-orange-300 p-2"><X size={24}/></button>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">DeepSeek API Key</label>
              <input
                type="password"
                defaultValue={apiKey}
                placeholder="sk-..."
                className="w-full border-2 border-orange-100 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 bg-orange-50/50 text-sm"
                id="deepseek-key-input"
              />
              <p className="text-[10px] text-orange-400 mt-2 leading-tight">
                * 请输入 DeepSeek 官方 API Key。<br/>
                * 密钥仅保存在您的浏览器本地。
              </p>
            </div>

            <button
              onClick={() => {
                const val = (document.getElementById('deepseek-key-input') as HTMLInputElement).value;
                setApiKey(val);
                localStorage.setItem(STORAGE_KEY_API, val);
                setShowSettings(false);
              }}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              保存设置
            </button>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 bg-orange-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-orange-900">添加私房菜</h3>
              <button onClick={() => setShowAddRecipe(false)} className="text-orange-300 p-2 bg-orange-50 rounded-full active:scale-90 transition-transform"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddRecipe} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">菜品名称</label>
                <input 
                  required
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="如：拿手红烧肉"
                  className="w-full bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-4 focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">所属分类</label>
                <div className="grid grid-cols-2 gap-2">
                  {['牛肉类', '猪肉/排骨类', '鸡肉类', '素菜/蛋/主食'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${newCategory === cat ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'border-orange-100 text-orange-400 bg-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">核心食材 (空格隔开)</label>
                <textarea 
                  value={newIngredients} 
                  onChange={e => setNewIngredients(e.target.value)}
                  placeholder="如：五花肉 冰糖 姜片 桂皮"
                  className="w-full bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-4 h-24 focus:border-orange-500 outline-none resize-none transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
              >
                <Check size={20} />
                确认加入
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-orange-200 text-[10px] tracking-widest font-bold uppercase">
        Personal Chef Assistant • Powered by DeepSeek
      </footer>
    </div>
  );
};

export default App;
