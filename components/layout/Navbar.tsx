"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoLockup } from "@/components/ui/Logo";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadPhoto } from "@/lib/uploadApi";

const PRODUCT_LINKS = [
  { label: "Digital Version", href: "/digital-version", note: "One Meeting. Every Language." },
  { label: "Physical Version", href: "/physical-version", note: "Real Conversations. No Language Barrier." },
];

const NAV_LINKS = [
  { label: "Demo", href: "/demo" },
  { label: "About Us", href: "/about" },
];

/** Closes a popover on Escape (returning focus to its trigger) or on an outside click/focus. */
function useDismiss(open: boolean, close: () => void, root: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        trigger.current?.focus();
      }
    };
    const onOutside = (e: Event) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open, close, root, trigger]);
}

function Avatar({ name, photoUrl, size = 36 }: { name: string; photoUrl?: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-mist"
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="text-slate" size={size / 2} aria-hidden />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { openWaitlist, isAuthenticated, isAuthLoading, logout } = useGatedWaitlist();
  const { user, updatePhoto } = useAuth();

  const [productsOpen, setProductsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);

  const productsRef = useRef<HTMLDivElement>(null);
  const productsButton = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeProducts = () => setProductsOpen(false);
  const closeAccount = () => setAccountOpen(false);
  const closeMobile = () => setMobileOpen(false);
  useDismiss(productsOpen, closeProducts, productsRef, productsButton);
  useDismiss(accountOpen, closeAccount, accountRef, accountButton);
  useDismiss(mobileOpen, closeMobile, mobileRef, mobileButton);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const productActive = PRODUCT_LINKS.some((l) => isActive(l.href));
  const loginHref = `/login?redirectTo=${encodeURIComponent(pathname || "/")}`;

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoStatus("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setPhotoStatus("Image must be less than 10MB.");
    setPhotoStatus("Uploading photo…");
    const reader = new FileReader();
    reader.onload = async () => {
      const uploaded = await uploadPhoto(reader.result as string);
      if (!uploaded) return setPhotoStatus("Photo upload failed. Please try again.");
      try {
        const res = await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: uploaded.url }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.status === "success" && data.data?.photoUrl) {
          updatePhoto(data.data.photoUrl);
          setPhotoStatus(null);
          return;
        }
      } catch {
        // fall through to the error message
      }
      setPhotoStatus("Photo could not be saved. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const linkClass = (active: boolean) =>
    `rounded-[8px] px-3 py-2 text-[15px] font-medium transition-colors ${
      active ? "text-primary" : "text-ink hover:bg-mist"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-page/95 pt-3 backdrop-blur-sm supports-[backdrop-filter]:bg-page/85">
      <div ref={mobileRef} className="page-container">
        <div className="flex h-16 items-center justify-between gap-4 rounded-[14px] border border-line bg-page px-3 md:px-4">
          <LogoLockup />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            <div ref={productsRef} className="relative">
              <button
                ref={productsButton}
                type="button"
                aria-expanded={productsOpen}
                aria-controls="products-menu"
                onClick={() => setProductsOpen((o) => !o)}
                className={`${linkClass(productActive)} inline-flex items-center gap-1`}
              >
                Products
                <ChevronDown size={16} aria-hidden className={`transition-transform duration-150 ${productsOpen ? "rotate-180" : ""}`} />
              </button>
              {productsOpen && (
                <ul
                  id="products-menu"
                  className="absolute left-0 top-full mt-2 w-64 rounded-[14px] border border-line bg-surface p-2 shadow-[0_12px_32px_-12px_rgb(24_43_58/0.25)]"
                >
                  {PRODUCT_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        onClick={closeProducts}
                        className="block rounded-[10px] px-3 py-2.5 transition-colors hover:bg-mist"
                      >
                        <span className="block text-[15px] font-medium text-ink">{link.label}</span>
                        <span className="block text-[13px] text-slate">{link.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={linkClass(isActive(link.href))}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated && user ? (
              <div ref={accountRef} className="relative">
                <button
                  ref={accountButton}
                  type="button"
                  aria-expanded={accountOpen}
                  aria-controls="account-menu"
                  aria-label="Account menu"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-mist"
                >
                  <Avatar name={user.name} photoUrl={user.photoUrl} />
                  <ChevronDown size={14} className="mr-1 text-slate" aria-hidden />
                </button>
                {accountOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 top-full mt-2 w-64 rounded-[14px] border border-line bg-surface p-2 shadow-[0_12px_32px_-12px_rgb(24_43_58/0.25)]"
                  >
                    <div className="border-b border-line px-3 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-[13px] text-slate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="mt-1 block w-full rounded-[10px] px-3 py-2 text-left text-sm text-ink hover:bg-mist"
                    >
                      {user.photoUrl ? "Change photo" : "Upload photo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                      className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-ink hover:bg-mist"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={loginHref} className={linkClass(false)}>
                Log In
              </Link>
            )}
            <Button size="sm" onClick={() => openWaitlist("navbar")} loading={isAuthLoading}>
              Join Waitlist
            </Button>
          </div>

          <button
            ref={mobileButton}
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-ink hover:bg-mist lg:hidden"
          >
            {mobileOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>

        {photoStatus && (
          <p role="status" className="mt-2 text-right text-[13px] text-slate">
            {photoStatus}
          </p>
        )}

        {mobileOpen && (
          <div
            id="mobile-menu"
            className="mt-2 rounded-[14px] border border-line bg-surface p-3 shadow-[0_12px_32px_-12px_rgb(24_43_58/0.25)] lg:hidden"
          >
            <nav aria-label="Mobile">
              <p className="eyebrow px-3 pb-1 pt-2">Products</p>
              {PRODUCT_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMobile} className={`block ${linkClass(isActive(link.href))}`}>
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-line" />
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMobile} className={`block ${linkClass(isActive(link.href))}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 px-3 pb-3">
                  <Avatar name={user.name} photoUrl={user.photoUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <div className="flex gap-4 text-[13px]">
                      <button type="button" className="text-link" onClick={() => fileInputRef.current?.click()}>
                        {user.photoUrl ? "Change photo" : "Upload photo"}
                      </button>
                      <button type="button" className="text-link" onClick={() => { closeMobile(); logout(); }}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={loginHref} onClick={closeMobile} className={`mb-2 block ${linkClass(false)}`}>
                  Log In
                </Link>
              )}
              <Button
                className="w-full"
                loading={isAuthLoading}
                onClick={() => {
                  closeMobile();
                  openWaitlist("navbar");
                }}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} tabIndex={-1} aria-hidden="true" />
    </header>
  );
}
