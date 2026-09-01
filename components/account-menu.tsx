'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
type User={email:string;avatar?:string}
export function AccountMenu(){const[user,setUser]=useState<User|null>(null);useEffect(()=>{const raw=localStorage.getItem('domscan-user');if(raw)setUser(JSON.parse(raw))},[]);if(!user)return <div className="flex gap-2"><Link href="/login" className="rounded-lg border px-4 py-2 text-sm">登录</Link><Link href="/register" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">注册</Link></div>;return <Link href="/account" className="flex items-center gap-2 rounded-full border bg-white px-2 py-1.5 text-sm hover:border-brand"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-orange-100 text-brand">{user.avatar?<img src={user.avatar} alt="头像" className="h-full w-full object-cover"/>:user.email[0].toUpperCase()}</span><span className="hidden max-w-32 truncate sm:block">{user.email}</span></Link>}
