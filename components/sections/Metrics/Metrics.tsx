'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import styles from './Metrics.module.css';

interface Metric {
  value: number;
  label: string;
  suffix?: string;
}

const metrics: Metric[] = [
  { value: 500, label: 'Autos vendidos', suffix: '+' },
  { value: 1000, label: 'Clientes satisfechos', suffix: '+' },
  { value: 20, label: 'Años de experiencia', suffix: '+' },
  { value: 15, label: 'Marcas disponibles', suffix: '+' },
];

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    });

    return () => clearInterval(timer);
  }, [isInView, value, controls]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
    >
      {count.toLocaleString('es-AR')}{suffix}
    </motion.span>
  );
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className={styles.section}>
      <div className={styles.container} ref={ref}>
        <div className={styles.grid}>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className={styles.metric}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: 'easeOut',
              }}
            >
              <div className={styles.valueWrapper}>
                <span className={styles.value}>
                  <CountUp value={metric.value} suffix={metric.suffix} />
                </span>
              </div>
              <p className={styles.label}>{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
