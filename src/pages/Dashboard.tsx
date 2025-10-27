import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { LogOut, Pill, Plus, Edit2, Save, X } from "lucide-react";

interface Pharmacy {
  id: string;
  nom: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  horaires?: string;
  telephone?: string;
}

interface Stock {
  stock_id: string;
  medicament_nom: string;
  medicament_forme?: string;
  medicament_dosage?: string;
  prix: number;
  quantite: number;
  disponible: boolean;
}

interface Medicament {
  id: string;
  nom: string;
  forme?: string;
  dosage?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewMedicamentForm, setShowNewMedicamentForm] = useState(false);
  const [newMedicament, setNewMedicament] = useState({
    nom: '',
    forme: '',
    dosage: '',
    description: ''
  });
  const [pharmacyForm, setPharmacyForm] = useState({
    nom: "",
    adresse: "",
    horaires: "",
    telephone: "",
  });
  const [newStock, setNewStock] = useState({
    medicament_id: "",
    prix: "",
    quantite: "",
    disponible: true,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            loadPharmacyData(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        loadPharmacyData(session.user.id);
      }
    });

    loadMedicaments();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPharmacyData = async (userId: string) => {
    try {
      // Load pharmacy info
      const { data: pharmacyData, error: pharmacyError } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (pharmacyError) throw pharmacyError;

      if (pharmacyData) {
        setPharmacy(pharmacyData);
        setPharmacyForm({
          nom: pharmacyData.nom || "",
          adresse: pharmacyData.adresse || "",
          horaires: pharmacyData.horaires || "",
          telephone: pharmacyData.telephone || "",
        });

        // Load stocks
        const { data: stocksData, error: stocksError } = await supabase.rpc('get_pharmacy_stocks', {
          pharmacy_id: pharmacyData.id
        });

        if (stocksError) throw stocksError;
        setStocks(stocksData || []);
      }
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMedicaments = async () => {
    try {
      const { data, error } = await supabase
        .from("medicaments")
        .select("*")
        .order("nom");

      if (error) throw error;
      setMedicaments(data || []);
    } catch (error) {
      console.error('Error loading medicaments:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const savePharmacyInfo = async () => {
    if (!user) return;

    try {
      if (pharmacy) {
        // Update existing pharmacy
        const { error } = await supabase
          .from("pharmacies")
          .update(pharmacyForm)
          .eq("id", pharmacy.id);

        if (error) throw error;
      } else {
        // Create new pharmacy
        const { data, error } = await supabase
          .from("pharmacies")
          .insert({
            ...pharmacyForm,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        setPharmacy(data);
      }

      toast({
        title: "Informations sauvegardées",
        description: "Les informations de votre pharmacie ont été mises à jour",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
  };

  const addNewMedicament = async () => {
    if (!newMedicament.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du médicament est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("medicaments")
        .insert({
          nom: newMedicament.nom.trim(),
          forme: newMedicament.forme.trim() || null,
          dosage: newMedicament.dosage.trim() || null,
          description: newMedicament.description.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh medicaments list
      await loadMedicaments();
      
      // Reset form and close
      setNewMedicament({ nom: '', forme: '', dosage: '', description: '' });
      setShowNewMedicamentForm(false);
      
      // Set the new medicament as selected
      setNewStock({ ...newStock, medicament_id: data.id });

      toast({
        title: "Médicament ajouté",
        description: "Le nouveau médicament a été ajouté à la liste",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le médicament",
        variant: "destructive",
      });
    }
  };

  const addStock = async () => {
    if (!pharmacy || !newStock.medicament_id || !newStock.prix || !newStock.quantite) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("stocks")
        .insert({
          pharmacie_id: pharmacy.id,
          medicament_id: newStock.medicament_id,
          prix: parseFloat(newStock.prix),
          quantite: parseInt(newStock.quantite),
          disponible: newStock.disponible,
        });

      if (error) throw error;

      toast({
        title: "Stock ajouté",
        description: "Le médicament a été ajouté à votre stock",
      });

      setNewStock({
        medicament_id: "",
        prix: "",
        quantite: "",
        disponible: true,
      });
      setShowAddForm(false);
      
      // Reload stocks
      loadPharmacyData(user!.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le stock",
        variant: "destructive",
      });
    }
  };

  const updateStock = async (stockId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update(updates)
        .eq("id", stockId);

      if (error) throw error;

      toast({
        title: "Stock mis à jour",
        description: "Les modifications ont été sauvegardées",
      });

      setEditingStock(null);
      
      // Reload stocks
      loadPharmacyData(user!.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard Pharmacie</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Informations de la pharmacie */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la pharmacie</CardTitle>
              <CardDescription>
                Renseignez les informations de votre pharmacie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la pharmacie</Label>
                <Input
                  id="nom"
                  value={pharmacyForm.nom}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, nom: e.target.value })}
                  placeholder="Pharmacie du Centre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={pharmacyForm.adresse}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, adresse: e.target.value })}
                  placeholder="123 Rue de la Santé, Cotonou"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaires">Horaires d'ouverture</Label>
                <Textarea
                  id="horaires"
                  value={pharmacyForm.horaires}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, horaires: e.target.value })}
                  placeholder="Lun-Ven: 8h-19h, Sam: 8h-15h"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={pharmacyForm.telephone}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, telephone: e.target.value })}
                  placeholder="+229 XX XX XX XX"
                />
              </div>
              <Button onClick={savePharmacyInfo} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </CardContent>
          </Card>

          {/* Ajouter un stock */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ajouter un médicament</CardTitle>
                  <CardDescription>
                    Ajoutez des médicaments à votre stock
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <Label htmlFor="medicament">Médicament</Label>
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => setShowNewMedicamentForm(!showNewMedicamentForm)}
                     >
                       {showNewMedicamentForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                       {showNewMedicamentForm ? "Annuler" : "Nouveau"}
                     </Button>
                   </div>
                   
                   {showNewMedicamentForm ? (
                     <div className="border rounded-md p-4 space-y-3 bg-muted/50">
                       <h4 className="font-medium text-sm">Ajouter un nouveau médicament</h4>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="new-nom" className="text-xs">Nom *</Label>
                           <Input
                             id="new-nom"
                             placeholder="Paracétamol"
                             value={newMedicament.nom}
                             onChange={(e) => setNewMedicament({ ...newMedicament, nom: e.target.value })}
                           />
                         </div>
                         <div>
                           <Label htmlFor="new-forme" className="text-xs">Forme</Label>
                           <Input
                             id="new-forme"
                             placeholder="Comprimé"
                             value={newMedicament.forme}
                             onChange={(e) => setNewMedicament({ ...newMedicament, forme: e.target.value })}
                           />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="new-dosage" className="text-xs">Dosage</Label>
                           <Input
                             id="new-dosage"
                             placeholder="500mg"
                             value={newMedicament.dosage}
                             onChange={(e) => setNewMedicament({ ...newMedicament, dosage: e.target.value })}
                           />
                         </div>
                         <div className="flex items-end">
                           <Button onClick={addNewMedicament} size="sm" className="w-full">
                             Ajouter
                           </Button>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <select
                       id="medicament"
                       className="w-full border border-input rounded-md px-3 py-2"
                       value={newStock.medicament_id}
                       onChange={(e) => setNewStock({ ...newStock, medicament_id: e.target.value })}
                     >
                       <option value="">Sélectionner un médicament</option>
                       {medicaments.map((med) => (
                         <option key={med.id} value={med.id}>
                           {med.nom} {med.forme && `(${med.forme})`} {med.dosage && `- ${med.dosage}`}
                         </option>
                       ))}
                     </select>
                   )}
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix (FCFA)</Label>
                  <Input
                    id="prix"
                    type="number"
                    value={newStock.prix}
                    onChange={(e) => setNewStock({ ...newStock, prix: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={newStock.quantite}
                    onChange={(e) => setNewStock({ ...newStock, quantite: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disponible"
                    checked={newStock.disponible}
                    onCheckedChange={(checked) => setNewStock({ ...newStock, disponible: checked })}
                  />
                  <Label htmlFor="disponible">Disponible</Label>
                </div>
                <Button onClick={addStock} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter au stock
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Liste des stocks */}
        <Card>
          <CardHeader>
            <CardTitle>Votre stock ({stocks.length} médicaments)</CardTitle>
            <CardDescription>
              Gérez vos médicaments disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stocks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun médicament en stock. Ajoutez votre premier médicament ci-dessus.
              </p>
            ) : (
              <div className="space-y-4">
                {stocks.map((stock) => (
                  <div key={stock.stock_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{stock.medicament_nom}</h4>
                        {(stock.medicament_forme || stock.medicament_dosage) && (
                          <p className="text-sm text-muted-foreground">
                            {stock.medicament_forme} {stock.medicament_dosage && `- ${stock.medicament_dosage}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={stock.disponible ? "success" : "destructive"}>
                          {stock.disponible ? "Disponible" : "Indisponible"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingStock(editingStock === stock.stock_id ? null : stock.stock_id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editingStock === stock.stock_id ? (
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Prix (FCFA)</Label>
                          <Input
                            type="number"
                            defaultValue={stock.prix}
                            onChange={(e) => {
                              const prix = parseFloat(e.target.value);
                              if (!isNaN(prix)) {
                                updateStock(stock.stock_id, { prix });
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label>Quantité</Label>
                          <Input
                            type="number"
                            defaultValue={stock.quantite}
                            onChange={(e) => {
                              const quantite = parseInt(e.target.value);
                              if (!isNaN(quantite)) {
                                updateStock(stock.stock_id, { quantite });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            onClick={() => updateStock(stock.stock_id, { disponible: !stock.disponible })}
                          >
                            {stock.disponible ? "Marquer indisponible" : "Marquer disponible"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>Prix: {stock.prix.toLocaleString()} FCFA</div>
                        <div>Quantité: {stock.quantite}</div>
                        <div>Stock: {stock.quantite > 0 ? "En stock" : "Rupture"}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;