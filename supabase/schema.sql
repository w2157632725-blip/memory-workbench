
-- Create knowledge_points table
create table knowledge_points (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create memory_items table for processed items (visual, story, etc)
create table memory_items (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'visual', 'story', 'podcast', 'feynman', 'cloze'
  content jsonb not null,
  knowledge_point_ids uuid[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table knowledge_points enable row level security;
alter table memory_items enable row level security;

-- Create policies (for now allowing public access for demo purposes, in production should be authenticated)
create policy "Public knowledge points are viewable by everyone."
  on knowledge_points for select
  using ( true );

create policy "Anyone can insert knowledge points."
  on knowledge_points for insert
  with check ( true );

create policy "Public memory items are viewable by everyone."
  on memory_items for select
  using ( true );

create policy "Anyone can insert memory items."
  on memory_items for insert
  with check ( true );
