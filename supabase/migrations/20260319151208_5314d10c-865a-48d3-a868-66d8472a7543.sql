
-- Add aadhayam, vyayam, rajapujyam, avamanam columns
ALTER TABLE public.rashi_phalalu
  ADD COLUMN aadayam integer DEFAULT 0,
  ADD COLUMN vyayam integer DEFAULT 0,
  ADD COLUMN rajapujyam integer DEFAULT 0,
  ADD COLUMN avamanam integer DEFAULT 0;

-- Update values from authentic panchangam source
UPDATE public.rashi_phalalu SET aadayam=11, vyayam=5, rajapujyam=2, avamanam=4 WHERE rashi_name_en='Mesha (Aries)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=5, vyayam=14, rajapujyam=5, avamanam=4 WHERE rashi_name_en='Vrushabha (Taurus)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=8, vyayam=11, rajapujyam=1, avamanam=7 WHERE rashi_name_en='Mithuna (Gemini)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=2, vyayam=11, rajapujyam=4, avamanam=7 WHERE rashi_name_en='Karkataka (Cancer)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=5, vyayam=5, rajapujyam=7, avamanam=7 WHERE rashi_name_en='Simha (Leo)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=8, vyayam=11, rajapujyam=3, avamanam=3 WHERE rashi_name_en='Kanya (Virgo)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=5, vyayam=14, rajapujyam=6, avamanam=3 WHERE rashi_name_en='Tula (Libra)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=11, vyayam=5, rajapujyam=2, avamanam=6 WHERE rashi_name_en='Vruchika (Scorpio)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=14, vyayam=11, rajapujyam=5, avamanam=6 WHERE rashi_name_en='Dhanus (Sagittarius)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=2, vyayam=8, rajapujyam=1, avamanam=2 WHERE rashi_name_en='Makara (Capricorn)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=2, vyayam=8, rajapujyam=4, avamanam=2 WHERE rashi_name_en='Kumbha (Aquarius)' AND samvatsaram='పరాభవ';
UPDATE public.rashi_phalalu SET aadayam=14, vyayam=11, rajapujyam=7, avamanam=2 WHERE rashi_name_en='Meena (Pisces)' AND samvatsaram='పరాభవ';
