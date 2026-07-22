-- Renomeia categorias de vídeos: "Social media" -> "Transmissões",
-- "Documentário" -> "After movie". Remove uso de "Institucional" nos vídeos
-- existentes, movendo-os para "Publicitário" (categoria mais próxima).
update public.videos set category = 'Transmissões' where category = 'Social media';
update public.videos set category = 'After movie' where category = 'Documentário';
update public.videos set category = 'Publicitário' where category = 'Institucional';
