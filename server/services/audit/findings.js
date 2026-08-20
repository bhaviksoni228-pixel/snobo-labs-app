function buildFindings(signals, technical, pageSpeed = null) {
  const critical = []
  const high = []
  const medium = []
  const positive = []

  /*
   * IMPORTANT:
   * These findings are evidence-based.
   *
   * A missing value from server HTML is NOT automatically
   * treated as a serious website fault.
   */

  // -----------------------------
  // SECURITY
  // -----------------------------

  if (!signals.hasSSL) {
    critical.push({
      category: 'Security',
      severity: 'critical',
      title: 'HTTPS is not confirmed',
      detail:
        'The audited URL did not resolve to HTTPS.',
      evidence:
        `Final URL: ${signals.url}`,
    })
  } else {
    positive.push({
      category: 'Security',
      title: 'HTTPS is enabled',
      detail:
        'The audited website resolves over HTTPS.',
    })
  }

  // -----------------------------
  // HTTP STATUS
  // -----------------------------

  if (signals.status >= 500) {
    critical.push({
      category: 'Technical',
      severity: 'critical',
      title:
        `Server returned HTTP ${signals.status}`,
      detail:
        'The website is returning a server-side error response.',
      evidence:
        `${signals.status} ${signals.statusText || ''}`,
    })
  } else if (signals.status >= 400) {
    high.push({
      category: 'Technical',
      severity: 'high',
      title:
        `Page returned HTTP ${signals.status}`,
      detail:
        'The requested page returned a client-error response.',
      evidence:
        `${signals.status} ${signals.statusText || ''}`,
    })
  } else if (
    signals.status >= 200 &&
    signals.status < 300
  ) {
    positive.push({
      category: 'Technical',
      title:
        'Page returned a successful HTTP response',
      detail:
        `The server returned HTTP ${signals.status}.`,
    })
  }

  // -----------------------------
  // PERFORMANCE
  // -----------------------------

  if (
    pageSpeed?.available &&
    typeof pageSpeed.scores?.performance === 'number'
  ) {
    const score =
      pageSpeed.scores.performance

    if (score < 50) {
      high.push({
        category: 'Performance',
        severity: 'high',
        title:
          'Poor mobile performance',
        detail:
          'The rendered mobile audit produced a performance score below 50.',
        evidence:
          `Lighthouse mobile score: ${score}/100`,
      })
    } else if (score < 75) {
      medium.push({
        category: 'Performance',
        severity: 'medium',
        title:
          'Mobile performance could be improved',
        detail:
          'The rendered mobile audit shows room for performance improvements.',
        evidence:
          `Lighthouse mobile score: ${score}/100`,
      })
    } else if (score >= 90) {
      positive.push({
        category: 'Performance',
        title:
          'Strong mobile performance',
        detail:
          'The rendered mobile audit produced a performance score of 90 or higher.',
        evidence:
          `${score}/100`,
      })
    }
  } else {
    /*
     * Don't invent a performance problem when
     * PageSpeed isn't available.
     */
  }

  // -----------------------------
  // CORE WEB VITALS
  // -----------------------------

  const lcp =
    pageSpeed?.metrics?.largestContentfulPaint

  if (
    lcp &&
    typeof lcp.numericValue === 'number'
  ) {
    if (lcp.numericValue > 4000) {
      high.push({
        category: 'Performance',
        severity: 'high',
        title:
          'Largest Contentful Paint is slow',
        detail:
          'The main visible content takes too long to appear on mobile.',
        evidence:
          lcp.displayValue ||
          `${Math.round(lcp.numericValue)} ms`,
      })
    } else if (lcp.numericValue <= 2500) {
      positive.push({
        category: 'Performance',
        title:
          'Largest Contentful Paint is healthy',
        detail:
          'The main content becomes visible within the recommended range.',
        evidence:
          lcp.displayValue ||
          `${Math.round(lcp.numericValue)} ms`,
      })
    }
  }

  const cls =
    pageSpeed?.metrics?.cumulativeLayoutShift

  if (
    cls &&
    typeof cls.numericValue === 'number'
  ) {
    if (cls.numericValue > 0.25) {
      high.push({
        category: 'UX',
        severity: 'high',
        title:
          'Excessive layout shifting',
        detail:
          'Page elements are moving significantly while the page loads.',
        evidence:
          cls.displayValue ||
          String(cls.numericValue),
      })
    } else if (cls.numericValue <= 0.1) {
      positive.push({
        category: 'UX',
        title:
          'Layout stability is strong',
        detail:
          'The measured layout shift is within the recommended range.',
        evidence:
          cls.displayValue ||
          String(cls.numericValue),
      })
    }
  }

  const tbt =
    pageSpeed?.metrics?.totalBlockingTime

  if (
    tbt &&
    typeof tbt.numericValue === 'number'
  ) {
    if (tbt.numericValue > 600) {
      high.push({
        category: 'Performance',
        severity: 'high',
        title:
          'High JavaScript blocking time',
        detail:
          'JavaScript is blocking the browser for a significant amount of time.',
        evidence:
          tbt.displayValue ||
          `${Math.round(tbt.numericValue)} ms`,
      })
    }
  }

  // -----------------------------
  // SEO — TITLE
  // -----------------------------

  if (!signals.title) {
    /*
     * LOW CONFIDENCE:
     * Server HTML may not contain metadata when
     * a site renders it dynamically.
     *
     * Therefore this is MEDIUM, not critical/high.
     */
    medium.push({
      category: 'SEO',
      severity: 'medium',
      title:
        'Title tag was not detected in server HTML',
      detail:
        'The initial HTML response did not contain a title element.',
      evidence:
        'Server-delivered HTML check. JavaScript-rendered metadata may differ.',
    })
  } else {
    const length =
      signals.titleLength

    if (
      length < 30 ||
      length > 65
    ) {