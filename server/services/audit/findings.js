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
      medium.push({
        category: 'SEO',
        severity: 'medium',
        title:
          'Title length could be improved',
        detail:
          "The title falls outside Snobo Labs' practical 30–65 character range.",
        evidence:
          `${length} characters`,
      })
    } else {
      positive.push({
        category: 'SEO',
        title:
          'Title tag is present',
        detail:
          'The page has a title with a reasonable length.',
        evidence:
          `${length} characters`,
      })
    }
  }

  // -----------------------------
  // SEO — DESCRIPTION
  // -----------------------------

  if (!signals.hasMetaDescription) {
    medium.push({
      category: 'SEO',
      severity: 'medium',
      title:
        'Meta description was not detected',
      detail:
        'A meta description was not found in the server-delivered HTML.',
      evidence:
        'Server HTML check. Dynamically generated metadata may not appear here.',
    })
  } else {
    positive.push({
      category: 'SEO',
      title:
        'Meta description is present',
      detail:
        'A meta description was detected.',
      evidence:
        `${signals.metaDescriptionLength} characters`,
    })
  }

  // -----------------------------
  // SEO — CANONICAL
  // -----------------------------

  if (!signals.hasCanonical) {
    medium.push({
      category: 'SEO',
      severity: 'medium',
      title:
        'Canonical URL was not detected',
      detail:
        'A canonical link was not found in the server-delivered HTML.',
      evidence:
        'Server HTML check.',
    })
  } else {
    positive.push({
      category: 'SEO',
      title:
        'Canonical URL is present',
      detail:
        'The page specifies a canonical URL.',
    })
  }

  // -----------------------------
  // SEO — STRUCTURED DATA
  // -----------------------------

  if (signals.structuredDataCount === 0) {
    medium.push({
      category: 'SEO',
      severity: 'medium',
      title:
        'Structured data was not detected',
      detail:
        'No JSON-LD structured data block was found in the server HTML.',
      evidence:
        'This does not prove that the website has no structured data elsewhere.',
    })
  } else {
    positive.push({
      category: 'SEO',
      title:
        'Structured data detected',
      detail:
        `${signals.structuredDataCount} JSON-LD block(s) were detected.`,
    })
  }

  // -----------------------------
  // ACCESSIBILITY — IMAGES
  // -----------------------------

  if (
    signals.totalImages > 0 &&
    signals.imagesWithoutAlt > 0
  ) {
    medium.push({
      category: 'Accessibility',
      severity: 'medium',
      title:
        'Some images lack alt attributes',
      detail:
        'Images without alternative text can be inaccessible to screen-reader users.',
      evidence:
        `${signals.imagesWithoutAlt} of ${signals.totalImages} images`,
    })
  } else if (signals.totalImages > 0) {
    positive.push({
      category: 'Accessibility',
      title:
        'Images have alt attributes',
      detail:
        'No images missing an alt attribute were detected in the server HTML.',
    })
  }

  // -----------------------------
  // MOBILE
  // -----------------------------

  if (!signals.hasViewport) {
    medium.push({
      category: 'Mobile',
      severity: 'medium',
      title:
        'Viewport metadata was not detected',
      detail:
        'The standard viewport declaration was not found in server HTML.',
      evidence:
        'Server HTML check.',
    })
  } else {
    positive.push({
      category: 'Mobile',
      title:
        'Viewport metadata is present',
      detail:
        'A standard mobile viewport declaration was detected.',
    })
  }

  // -----------------------------
  // SOCIAL
  // -----------------------------

  if (!signals.hasOpenGraph) {
    medium.push({
      category: 'Social',
      severity: 'medium',
      title:
        'Open Graph metadata was not detected',
      detail:
        'Social platforms may have less control over the preview generated when this page is shared.',
      evidence:
        'Server HTML check.',
    })
  } else {
    positive.push({
      category: 'Social',
      title:
        'Open Graph metadata detected',
      detail:
        'Open Graph metadata was found in the server HTML.',
    })
  }

  // -----------------------------
  // TECHNICAL SEO
  // -----------------------------

  if (!technical?.robotsTxt?.reachable) {
    medium.push({
      category: 'Technical SEO',
      severity: 'medium',
      title:
        'robots.txt was not confirmed',
      detail:
        'A reachable robots.txt file was not detected.',
    })
  } else {
    positive.push({
      category: 'Technical SEO',
      title:
        'robots.txt is reachable',
      detail:
        'The website exposes a reachable robots.txt file.',
    })
  }

  if (!technical?.sitemap?.reachable) {
    medium.push({
      category: 'Technical SEO',
      severity: 'medium',
      title:
        'XML sitemap was not confirmed',
      detail:
        'A reachable XML sitemap was not detected.',
    })
  } else {
    positive.push({
      category: 'Technical SEO',
      title:
        'XML sitemap is reachable',
      detail:
        'A sitemap was successfully reached.',
      evidence:
        technical.sitemap.url,
    })
  }

  // -----------------------------
  // CONVERSION
  // -----------------------------

  const hasContactPath =
    signals.formCount > 0 ||
    signals.hasEmail ||
    signals.hasPhoneNumber ||
    signals.hasWhatsApp ||
    signals.hasChatWidget

  if (!hasContactPath) {
    medium.push({
      category: 'Conversion',
      severity: 'medium',
      title:
        'No obvious contact path was detected',
      detail:
        'The server-delivered HTML did not expose a form, email, phone number, WhatsApp link, or common chat widget.',
      evidence:
        'This is a detection result, not proof that the rendered website lacks a contact option.',
    })
  } else {
    positive.push({
      category: 'Conversion',
      title:
        'A customer contact path was detected',
      detail:
        'At least one contact or communication mechanism was detected.',
    })
  }

  // -----------------------------
  // RETURN
  // -----------------------------

  return {
    critical: critical.slice(0, 5),
    high: high.slice(0, 8),
    medium: medium.slice(0, 12),
    positive: positive.slice(0, 12),
  }
}

module.exports = {
  buildFindings,
}