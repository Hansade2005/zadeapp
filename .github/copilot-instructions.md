# ZadeApp - Nigerian Multi-Marketplace Platform

## Architecture Overview
- **Frontend**: React 19 + TypeScript SPA built with Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling**: Tailwind CSS + Radix UI themes
- **Routing**: React Router v6 with protected routes
- **State**: React Context for auth, local state for cart/UI
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Toastify

## Core Data Model
User types: `buyer`, `seller`, `freelancer`, `employer`, `admin`
- All tables use UUID primary keys with `uuid_generate_v4()`
- Row Level Security (RLS) enabled on all tables
- Foreign keys cascade on delete where appropriate
- Arrays for `images`, `tags`, `skills`, etc.
remember you have full access to my db via supabase mcp toool  so make use of it when needed 
- Project Tracker file to always keep updated and synced as you build FEATURE_BLUEPRINT.md


## Project Goals 

ZadeApp
Multivendor market place; sale of products and services, including job search and immediate hire for applicants

Section A:
Online market / product sales

List product categories
Search locator for item search

   ⁃    sellers contact (include business number, email), business location, addresses,
   ⁃    Profile picture of sale items; include item description, prices and available discounts
   ⁃    Shopping cart/ ordering sales
   ⁃    Arrange sale items for easy reference
   ⁃    Search locator for users to search out items they want to buy on the site
   ⁃    GPS to locate nearby shops
   ⁃     Chat box for instant messaging
   ⁃    Marketers can boost their online visibility based any approved credit system or subscription
   ⁃    
    SECTION B
Job search/hire for qualified applicants.

Employers advertise open positions, while accepting applications from qualified employees.

Job categories:
-formal certified jobs
-menial jobs ( home/office plumber, house cleaner) users can log in to advertise contract or daily jobs.
Required for menial jobs; special job description and location,


Required for formal job employers.
Employer contact
-Office address
-Number
-Website,  and clear job description that matches with site expectations of credible

Anyone can view advertised postings but only active account holders can apply for positions.
Active account holders are people who sign up on the site with their useful information and correct identification.

Employers can boost their visibility on the site by a credit system which will be purchased by them.

Payment system integration
PayPal and bank information integration


Section C Entertainment

Events stars; Artiste, Deejay, instrumentalists.

Event host advertises upcoming event, eg wedding, birthday or street party while artistes and performers apply for positions,
Including party Deejay, band groups, instrumentalist eg pianist, guitar player
Ushers or any event organizers

Artistes get hired on the site based on artiste credential profiling;
eg Artist videos,
Podcasts
Gallery of pictures
artist Biography
Jobs completed and site ratings,
Include links to artist website or social media

Artiste categories
Musicians and band
Deejay
Models
Ushers and event staff, event organizers
Venue managers
Decoration staff
Lights and stage; mechanics and equipment hire

Freelance section

   ⁃    Hire online bloggers,
   ⁃    Social media managers,
   ⁃    Creative artists including graphic designers, photo editors, video editors
   ⁃    Online tutors

     About information of artiste and models

   ⁃    Artiste video
   ⁃    Audio
   ⁃    Artist social media link

   ⁃    Chat box for artist-client communication

Registered host can advertise events
Only registered/active account users can apply for event openings such as hiring a deejay.
Any online user can view advertised postings but only active account owners can apply to them.

## Key Patterns & Conventions

### Authentication
```typescript
// Always check auth state before database operations
const { user } = useAuth();
if (!user) return; // or redirect

// Database queries respect RLS automatically
const { data } = await supabase.from('products').select('*');
```

### Component Structure
```typescript
interface ComponentProps {
  // Required props first, optional with ?
  id: string;
  name: string;
  onAction?: (id: string) => void;
}

const Component: React.FC<ComponentProps> = ({ id, name, onAction }) => {
  // Component logic
};
```

### Database Operations
```typescript
// Fetch with error handling
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);

if (error) console.error('Error:', error);

// Insert with proper typing
const { error } = await supabase
  .from('products')
  .insert({
    seller_id: user.id,
    title,
    price: Number(price),
    // ... other fields
  });
```

### Responsive Design
- Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern
- Mobile navigation via `MobileBottomNav` component
- Desktop navigation in `Header`

### Cart Management
```typescript
// Cart state is local, not persisted
const [cartItems, setCartItems] = useState<CartItem[]>([]);

// Add to cart pattern
setCartItems(prev => {
  const existing = prev.find(item => item.id === productId);
  if (existing) {
    return prev.map(item =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
  }
  return [...prev, newItem];
});
```

### Form Validation
```typescript
// Use react-hook-form with Zod schema
const schema = z.object({
  email: z.string().email(),
  price: z.number().min(0),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

## Development Workflow

### Environment Setup
```bash
# Install dependencies
pnpm install

# Copy env template
cp .env.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
pnpm dev
```

### Database Schema
- Use supabase mcp tool to interact with our Supabase project
- Apply via Supabase mcp tool
- Types generated from schema in `src/lib/supabase.ts`

### Build & Deploy
```bash
pnpm build    # TypeScript + Vite build
pnpm lint     # ESLint check
pnpm preview  # Preview production build
```

## Common Patterns

### Page Structure
```typescript
// Pages follow this pattern
const Page: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20 md:pb-0">
        {/* Page content */}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
```

### Error Handling
```typescript
try {
  const { error } = await supabase.from('table').insert(data);
  if (error) throw error;
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Something went wrong');
}
```

### Loading States
```typescript
{loading ? (
  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
) : (
  <div>Content</div>
)}
```

## Key Files
- `src/lib/supabase.ts` - Database client & types
- `src/contexts/AuthContext.tsx` - Authentication state
- Use supabase mcp  tool to get  - Complete database structure
- `src/components/` - Reusable UI components
- `src/pages/` - Route components

## Gotchas
- All database operations require authentication for RLS
- Cart state is not persisted - use localStorage if needed
- Image URLs are stored as arrays in database
- User type determines available features/permissions
- Mobile navigation uses bottom tabs, desktop uses header