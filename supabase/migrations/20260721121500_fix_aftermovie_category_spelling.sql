-- Corrige grafia da categoria: "After movie" -> "Aftermovie" (junto).
update public.videos set category = 'Aftermovie' where category = 'After movie';
