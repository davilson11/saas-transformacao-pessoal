import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacidade(.*)",
  "/termos(.*)",
  "/api/webhook(.*)",

  // ─── Rotas de máquina ──────────────────────────────────────────────────
  //
  // Chamadas por cron (Vercel) e pelo Stripe, não por um navegador logado.
  // Não existe sessão do Clerk nelas — e sem esta liberação o `auth.protect()`
  // reescrevia a requisição para 404.
  //
  // Esse era o segundo bug do lembrete diário: mesmo depois de a rota passar a
  // aceitar GET, o cron continuava recebendo 404 aqui, antes de chegar na rota.
  // O sintoma era enganoso — parecia rota inexistente, era rota bloqueada.
  //
  // Elas NÃO ficam abertas: cada uma exige `Authorization: Bearer CRON_SECRET`
  // e falha fechada se a variável não estiver definida. A autenticação delas é
  // o secret, não a sessão.
  "/api/push/send(.*)",
  "/api/notify(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
