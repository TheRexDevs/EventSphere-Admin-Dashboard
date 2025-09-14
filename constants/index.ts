export const languages = process.env.NEXT_PUBLIC_LANG 
  ? JSON.parse(process.env.NEXT_PUBLIC_LANG) 
  : ["en"];
