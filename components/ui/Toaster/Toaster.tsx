'use client'

import { Toaster as SileoToaster } from 'sileo'
import 'sileo/styles.css'

interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export default function Toaster({ position = 'top-right' }: ToasterProps) {
  return (
    <>
      <div style={{ position: 'fixed', zIndex: 99999, pointerEvents: 'none' }}>
        <SileoToaster
          position={position}
          theme="light"
          offset={{ top: '80px', right: '1rem' }}
          options={{
            duration: 5000,
            roundness: 8,
          }}
        />
      </div>
      <style jsx global>{`
        /* Ensure Sileo notifications appear above all other elements */
        [data-sileo-toaster] {
          z-index: 99999 !important;
        }
        [data-sileo-toast] {
          z-index: 99999 !important;
        }
        /* Override any parent container constraints */
        [data-sileo-toaster] > * {
          z-index: 99999 !important;
        }
      `}</style>
    </>
  )
}
