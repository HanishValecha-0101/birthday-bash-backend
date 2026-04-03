import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";

type Cuisine =
  | "all"
  | "indian"
  | "italian"
  | "japanese"
  | "chinese"
  | "south-indian"
  | "desserts"
  | "tiramisu"
  | "thai"
  | "mexican"
  | "mediterranean"
  | "korean"
  | "vietnamese"
  | "american"
  | "turkish"
  | "irish";

type Spot = {
  name: string;
  area: string;
  cuisine: Exclude<Cuisine, "all">;
  vibe: string;
  bestFor: string;
  mustTry: string;
  mapsUrl: string;
};

const spots: Spot[] = [
  // Indian
  { name: "Kinara Kitchen", area: "Ranelagh", cuisine: "indian", vibe: "Warm, elegant, neighbourhood gem", bestFor: "A birthday dinner with rich Indian flavours", mustTry: "Lamb rogan josh, garlic naan, and mango lassi", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kinara+Kitchen+Dublin" },
  { name: "Pickle Restaurant", area: "Camden Street", cuisine: "indian", vibe: "Modern Indian with a creative twist", bestFor: "Upscale Indian dining for a special occasion", mustTry: "Tasting menu and craft cocktails", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pickle+Restaurant+Dublin" },
  { name: "Bombay Pantry", area: "Multiple locations", cuisine: "indian", vibe: "Casual, flavour-packed, great value", bestFor: "Quick Indian takeaway or dine-in", mustTry: "Butter chicken, biryani, and samosas", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bombay+Pantry+Dublin" },

  // South Indian
  { name: "Dosa Dosa", area: "Parnell Street", cuisine: "south-indian", vibe: "Authentic South Indian flavours", bestFor: "Dosa lovers craving the real deal", mustTry: "Masala dosa, idli, and filter coffee", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dosa+Dosa+Dublin" },
  { name: "Kerala Kitchen", area: "Parnell Street", cuisine: "south-indian", vibe: "Homestyle Kerala cooking", bestFor: "Proper South Indian thali experience", mustTry: "Kerala fish curry, appam, and payasam", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kerala+Kitchen+Dublin" },

  // Italian
  { name: "Luna Restaurant", area: "Drury Street", cuisine: "italian", vibe: "Romantic, candlelit, old-school Italian", bestFor: "A birthday dinner with pasta and wine", mustTry: "Fresh pasta, tiramisu, and house wine", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Luna+Restaurant+Dublin" },
  { name: "Pi Pizza", area: "South George's Street", cuisine: "italian", vibe: "Buzzy, casual pizza joint", bestFor: "Quick wood-fired pizza with friends", mustTry: "Margherita and truffle pizza", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pi+Pizza+Dublin" },

  // Japanese
  { name: "Yamamori Sushi", area: "South Great George's Street", cuisine: "japanese", vibe: "Lively Japanese atmosphere with a buzzing crowd", bestFor: "Sushi lovers who want a fun, social dinner spot", mustTry: "Sushi platters, ramen bowls, and sake", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Yamamori+Sushi+Dublin" },
  { name: "Musashi Noodles & Sushi", area: "Capel Street", cuisine: "japanese", vibe: "Quick, casual, always packed — a local favourite", bestFor: "A fast sushi or noodle hit between activities", mustTry: "Bento boxes, sushi rolls, and udon", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Musashi+Noodles+Sushi+Dublin" },
  { name: "Umi Falafel & Ramen", area: "Dame Street", cuisine: "japanese", vibe: "Affordable ramen in central Dublin", bestFor: "A warm bowl of ramen on a rainy day", mustTry: "Tonkotsu ramen and gyoza", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Umi+Falafel+Dublin" },

  // Chinese
  { name: "M&L Chinese Restaurant", area: "Cathedral Street", cuisine: "chinese", vibe: "Authentic Chinese food, no-frills charm", bestFor: "A proper Chinese feast with big portions", mustTry: "Dim sum, crispy duck, and hand-pulled noodles", mapsUrl: "https://www.google.com/maps/search/?api=1&query=M%26L+Chinese+Restaurant+Dublin" },
  { name: "Hang Dai Chinese", area: "Camden Street", cuisine: "chinese", vibe: "Retro-glam Chinese with cocktails and dim lighting", bestFor: "A birthday dinner with Chinese food and cocktail vibes", mustTry: "Peking duck, dumplings, and signature cocktails", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hang+Dai+Chinese+Dublin" },

  // Thai
  { name: "Tuk Tuk", area: "Baggot Street", cuisine: "thai", vibe: "Vibrant, fast-casual Thai street food", bestFor: "Quick Thai bites packed with flavour", mustTry: "Pad Thai, green curry, and spring rolls", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Tuk+Tuk+Dublin" },
  { name: "Saba", area: "Clarendon Street", cuisine: "thai", vibe: "Stylish Thai-Vietnamese with great cocktails", bestFor: "An upscale Thai dinner with friends", mustTry: "Massaman curry, papaya salad, and Thai iced tea", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Saba+Dublin" },

  // Mexican
  { name: "777", area: "South Great George's Street", cuisine: "mexican", vibe: "Dark, moody, tequila-fuelled", bestFor: "A late-night Mexican dinner with cocktails", mustTry: "Tacos, mezcal cocktails, and churros", mapsUrl: "https://www.google.com/maps/search/?api=1&query=777+Restaurant+Dublin" },
  { name: "Boojum", area: "Multiple locations", cuisine: "mexican", vibe: "Fast, fresh, build-your-own burrito", bestFor: "A quick burrito between activities", mustTry: "Chicken burrito bowl and nachos", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Boojum+Dublin" },

  // Mediterranean
  { name: "Brother Hubbard", area: "Capel Street", cuisine: "mediterranean", vibe: "Bright, buzzy, great for long chats", bestFor: "A stylish lunch with strong coffee and sharing plates", mustTry: "Middle Eastern brunch plates and pastries", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brother+Hubbard+Dublin" },
  { name: "Eathos", area: "Aungier Street", cuisine: "mediterranean", vibe: "Healthy, colourful, Mediterranean bowls", bestFor: "A light and fresh meal", mustTry: "Falafel bowl, hummus plate, and fresh juices", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eathos+Dublin" },

  // Korean
  { name: "Kimchi Hophouse", area: "Parnell Street", cuisine: "korean", vibe: "Cozy Korean comfort food hub", bestFor: "Korean fried chicken and soju night", mustTry: "KFC (Korean fried chicken), bibimbap, and kimchi jjigae", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kimchi+Hophouse+Dublin" },
  { name: "Bam Bam", area: "Clarendon Street", cuisine: "korean", vibe: "Modern Korean-fusion with a fun menu", bestFor: "A trendy Korean dinner with friends", mustTry: "Korean BBQ tacos and bulgogi rice bowl", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bam+Bam+Dublin" },

  // Vietnamese
  { name: "Neon Asian Street Food", area: "Camden Street", cuisine: "vietnamese", vibe: "Colourful, fast-casual, flavour-packed", bestFor: "Quick Asian bites — Vietnamese and more", mustTry: "Pho, banh mi, and bubble tea", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Neon+Asian+Street+Food+Dublin" },
  { name: "Pho Viet", area: "Parnell Street", cuisine: "vietnamese", vibe: "Authentic Vietnamese in Dublin's Asian quarter", bestFor: "A big bowl of pho on a cold day", mustTry: "Beef pho, Vietnamese coffee, and summer rolls", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pho+Viet+Dublin" },

  // American
  { name: "Bunsen", area: "Multiple locations", cuisine: "american", vibe: "Minimalist burger perfection", bestFor: "The best burger in Dublin, no debate", mustTry: "Cheeseburger with hand-cut chips", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bunsen+Burger+Dublin" },
  { name: "Wowburger", area: "Multiple locations", cuisine: "american", vibe: "Fun, retro, late-night vibes", bestFor: "Casual burgers and shakes with friends", mustTry: "Double cheeseburger and Oreo shake", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Wowburger+Dublin" },

  // Turkish
  { name: "Dada Moroccan & Turkish", area: "South William Street", cuisine: "turkish", vibe: "Cozy, aromatic, beautifully decorated", bestFor: "A unique birthday dinner experience", mustTry: "Lamb tagine, mezze platter, and Turkish tea", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dada+Restaurant+Dublin" },
  { name: "Turkish Kebab House", area: "Parnell Street", cuisine: "turkish", vibe: "Authentic, generous portions, no fuss", bestFor: "Late-night kebabs and grills", mustTry: "Mixed grill platter, kofte, and baklava", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Turkish+Kebab+House+Dublin" },

  // Desserts
  { name: "Queen of Tarts", area: "Cow's Lane", cuisine: "desserts", vibe: "Cozy, sweet, old-Dublin charm", bestFor: "Cake stop, coffee stop, or a soft landing after lunch", mustTry: "Cheesecakes, lemon tart, and afternoon coffee", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Queen+of+Tarts+Dublin" },
  { name: "The Cake Cafe", area: "Pleasants Place", cuisine: "desserts", vibe: "Hidden-gem courtyard energy", bestFor: "A relaxed birthday cake moment with photos", mustTry: "Cake slices and tea in the garden", mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Cake+Cafe+Dublin" },
  { name: "Murphy's Ice Cream", area: "Wicklow Street", cuisine: "desserts", vibe: "Artisan Irish ice cream heaven", bestFor: "A sweet treat while exploring the city", mustTry: "Sea salt, Dingle gin, and brown bread ice cream", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Murphy's+Ice+Cream+Dublin" },

  // Tiramisu
  { name: "Etto", area: "Merrion Row", cuisine: "tiramisu", vibe: "Intimate Italian wine bar with a stellar menu", bestFor: "The best tiramisu in Dublin, hands down", mustTry: "Tiramisu, fresh pasta, and Italian wine", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Etto+Dublin" },
  { name: "Forno 500", area: "Dame Street", cuisine: "tiramisu", vibe: "Authentic Neapolitan restaurant", bestFor: "Tiramisu and espresso after a pizza dinner", mustTry: "Classic tiramisu and cannoli", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Forno+500+Dublin" },

  // Irish
  { name: "The Woollen Mills", area: "Ha'penny Bridge", cuisine: "irish", vibe: "Dublin classic with a lively room", bestFor: "A city-centre birthday lunch with easy walkability", mustTry: "Irish comfort food with a modern edge", mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Woollen+Mills+Dublin" },
  { name: "Fade Street Social", area: "City Centre", cuisine: "irish", vibe: "Modern and polished without feeling too stiff", bestFor: "A birthday dinner where the group wants a little wow factor", mustTry: "Shared plates and rooftop mood", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Fade+Street+Social+Dublin" },
  { name: "Café en Seine", area: "Dawson Street", cuisine: "irish", vibe: "Big birthday energy and iconic interiors", bestFor: "A dress-up dinner that can roll into cocktails", mustTry: "Cocktails and a full celebratory dinner booking", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+en+Seine+Dublin" },
];

const cuisineOptions: { id: Cuisine; label: string }[] = [
  { id: "all", label: "All Cuisines" },
  { id: "indian", label: "Indian" },
  { id: "south-indian", label: "South Indian" },
  { id: "italian", label: "Italian" },
  { id: "japanese", label: "Japanese" },
  { id: "chinese", label: "Chinese" },
  { id: "thai", label: "Thai" },
  { id: "mexican", label: "Mexican" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "korean", label: "Korean" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "american", label: "American" },
  { id: "turkish", label: "Turkish" },
  { id: "desserts", label: "Desserts" },
  { id: "tiramisu", label: "Tiramisu" },
  { id: "irish", label: "Irish" },
];

const DublinGuide = () => {
  const [cuisine, setCuisine] = useState<Cuisine>("all");
  const [search, setSearch] = useState("");

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();

    return spots.filter((spot) => {
      const matchesCuisine = cuisine === "all" || spot.cuisine === cuisine;
      const cuisineLabel = cuisineOptions.find((c) => c.id === spot.cuisine)?.label ?? "";
      const matchesQuery =
        query.length === 0 ||
        [spot.name, spot.area, spot.vibe, spot.bestFor, spot.mustTry, spot.cuisine, cuisineLabel].some((v) =>
          v.toLowerCase().includes(query)
        );
      return matchesCuisine && matchesQuery;
    });
  }, [cuisine, search]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">🍽️ Dublin Food Guide</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Curated birthday-friendly Dublin picks across {cuisineOptions.length - 1} cuisines — search by name, cuisine, or food type.
          </p>
        </motion.div>

        <section className="space-y-4 rounded-[1.8rem] border border-border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Cuisine filter dropdown */}
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value as Cuisine)}
              className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {cuisineOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.id === "all" ? "Filter by Cuisine" : option.label}
                </option>
              ))}
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, cuisine, or food..."
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary lg:max-w-xs"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSpots.map((spot) => {
              const label = cuisineOptions.find((c) => c.id === spot.cuisine)?.label ?? spot.cuisine;
              return (
                <motion.article
                  key={spot.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1.6rem] border border-border bg-muted/25 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{spot.name}</h2>
                      <p className="text-xs text-muted-foreground">{spot.area}</p>
                    </div>
                    <span className="rounded-full bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <p className="text-foreground">{spot.vibe}</p>
                    <p className="text-muted-foreground"><span className="text-foreground">Best for:</span> {spot.bestFor}</p>
                    <p className="text-muted-foreground"><span className="text-foreground">Try:</span> {spot.mustTry}</p>
                  </div>

                  <a
                    href={spot.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Open in Maps
                  </a>
                </motion.article>
              );
            })}
          </div>

          {filteredSpots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No matches — try another cuisine or search term.
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default DublinGuide;
