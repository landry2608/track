// Créer les composants de base nécessaires puisqu'ils ne sont pas disponibles dans ce contexte
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b">{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "default", className = "", size = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-gray-100",
    outline: "border border-gray-300 hover:bg-gray-100",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3",
    icon: "h-9 w-9",
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-[60px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Switch = ({ checked, onCheckedChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
    onClick={() => onCheckedChange(!checked)}
  >
    <span
      className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

const MobileTracker = () => {
  // Structure de base pour une nouvelle catégorie
  const createEmptyCategory = () => ({
    objectif: '',
    realisation: '',
    status: ''
  });

  // Fonction pour calculer les statistiques d'une catégorie
  const calculateCategoryStats = (category) => {
    const stats = {
      achieved: 0,
      notAchieved: 0,
      successRate: 0,
      creationDate: '',
      deletionDate: null
    };

    // Parcourir toutes les entrées du localStorage pour cette catégorie
    Object.keys(localStorage)
      .filter(key => key.startsWith('tracker_'))
      .sort()
      .forEach(key => {
        try {
          const dayData = JSON.parse(localStorage.getItem(key));
          if (dayData[category]) {
            if (!stats.creationDate) {
              stats.creationDate = key.replace('tracker_', '');
            }
            if (dayData[category].status === 'Atteint') {
              stats.achieved++;
            } else if (dayData[category].status === 'Non atteint') {
              stats.notAchieved++;
            }
          }
        } catch (error) {
          console.error('Erreur lors de la lecture des données:', error);
        }
      });

    const total = stats.achieved + stats.notAchieved;
    stats.successRate = total > 0 ? Math.round((stats.achieved / total) * 100) : 0;

    return stats;
  };

  const [categories, setCategories] = React.useState([
    'famille',
    'sante',
    'entrepreneuriat'
  ]);

  const [activeTab, setActiveTab] = React.useState('today');
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [currentData, setCurrentData] = React.useState({});
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  
  // États pour la gestion des catégories
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);

  React.useEffect(() => {
    // Chargement des catégories
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    // Chargement des données du jour
    const savedData = localStorage.getItem(`tracker_${selectedDate}`);
    if (savedData) {
      setCurrentData(JSON.parse(savedData));
    } else {
      const newData = categories.reduce((acc, category) => {
        acc[category] = createEmptyCategory();
        return acc;
      }, {});
      newData.reflexion = '';
      setCurrentData(newData);
    }
  }, [selectedDate]);

  const handleTaskChange = (category, field, value) => {
    setCurrentData(prev => {
      if (category === 'reflexion') {
        return { ...prev, reflexion: value };
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim().toLowerCase())) {
      const updatedCategories = [...categories, newCategoryName.trim().toLowerCase()];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      
      setCurrentData(prev => ({
        ...prev,
        [newCategoryName.trim().toLowerCase()]: createEmptyCategory()
      }));
      
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category);
  };

  const handleEditCategory = () => {
    if (newCategoryName.trim() && editingCategory && newCategoryName.trim().toLowerCase() !== editingCategory) {
      // Mise à jour de la liste des catégories
      const updatedCategories = categories.map(cat => 
        cat === editingCategory ? newCategoryName.trim().toLowerCase() : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      // Mise à jour des données actuelles
      const updatedData = { ...currentData };
      updatedData[newCategoryName.trim().toLowerCase()] = updatedData[editingCategory];
      delete updatedData[editingCategory];
      setCurrentData(updatedData);

      // Mise à jour des données historiques
      Object.keys(localStorage)
        .filter(key => key.startsWith('tracker_'))
        .forEach(key => {
          const dayData = JSON.parse(localStorage.getItem(key));
          if (dayData[editingCategory]) {
            dayData[newCategoryName.trim().toLowerCase()] = dayData[editingCategory];
            delete dayData[editingCategory];
            localStorage.setItem(key, JSON.stringify(dayData));
          }
        });

      setEditingCategory(null);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));

    // Suppression des données de la catégorie
    const updatedData = { ...currentData };
    delete updatedData[categoryToDelete];
    setCurrentData(updatedData);
  };

  const saveData = () => {
    localStorage.setItem(`tracker_${selectedDate}`, JSON.stringify(currentData));
  };

  const renderTodayView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
        />
      </div>
      
      {categories.map(category => (
        <Card key={category} className="mb-4">
          <CardHeader>
            {editingCategory === category ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleEditCategory} size="sm">
                  Valider
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold capitalize">
                  {category}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditingCategory(category)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Objectif</label>
              <Input
                value={currentData[category]?.objectif || ''}
                onChange={(e) => handleTaskChange(category, 'objectif', e.target.value)}
                placeholder={`Objectif ${category}`}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Réalisation</label>
              <Input
                value={currentData[category]?.realisation || ''}
                onChange={(e) => handleTaskChange(category, 'realisation', e.target.value)}
                placeholder="Ce que j'ai accompli"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <div className="flex gap-2">
                <Button
                  variant={currentData[category]?.status === 'Atteint' ? "default" : "outline"}
                  onClick={() => handleTaskChange(category, 'status', 'Atteint')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Atteint
                </Button>
                <Button
                  variant={currentData[category]?.status === 'Non atteint' ? "default" : "outline"}
                  onClick={() => handleTaskChange(category, 'status', 'Non atteint')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Non atteint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {isAddingCategory ? (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nom de la nouvelle catégorie"
                className="flex-1"
              />
              <Button onClick={handleAddCategory}>Ajouter</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsAddingCategory(true)}
          className="w-full mb-4"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une catégorie
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Réflexion</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentData.reflexion || ''}
            onChange={(e) => handleTaskChange('reflexion', '', e.target.value)}
            placeholder="Ce que je retiens de ma journée..."
            className="min-h-24"
          />
        </CardContent>
      </Card>

      <Button onClick={saveData} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );

  const renderStatsView = () => (
