<?php
/**
 * Plugin Name: Commons (21st Gov) asset loader
 * Description: Loads the Commons component CSS and progressive-enhancement runtime from the CDN.
 * Author:      21st Gov
 * Version:     0.3.0
 *
 * Two ways to use this:
 *   1. Drop this file in wp-content/mu-plugins/ (create the folder if it does
 *      not exist). Must-use plugins load on every request and survive theme
 *      switches — nothing to activate.
 *   2. Or copy just the wp_enqueue_scripts callback below into your active
 *      theme's functions.php.
 *
 * Docs: https://commonsui.com/docs/without-react
 * Pin the version you tested against — CDN paths are immutable. For production,
 * swap commons.css -> commons.min.css and commons.js -> commons.min.js.
 */

if (!defined('ABSPATH')) {
    exit; // No direct access.
}

add_action('wp_enqueue_scripts', function () {
    $version = '0.3.0';
    $base    = "https://cdn.commonsui.com/v{$version}";

    // Passing null as the version arg stops WordPress appending ?ver= — the CDN
    // path is already versioned and immutable, so it caches better without it.
    wp_enqueue_style('commons', "{$base}/commons.css", array(), null);

    // Optional: self-hosted Atkinson Hyperlegible fonts (system fonts work without it).
    // wp_enqueue_style('commons-fonts', "{$base}/fonts.css", array(), null);

    // commons.js auto-enhances every .cui-* region on the page. The `strategy`
    // key needs WordPress 6.3+; on older cores drop it and pass `true` as the
    // last argument to load in the footer instead.
    wp_enqueue_script('commons', "{$base}/commons.js", array(), null, array(
        'strategy'  => 'defer',
        'in_footer' => true,
    ));
});
