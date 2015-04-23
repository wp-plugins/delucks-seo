<?php 
/**
 * XML Sitemap Feed Template for pages feed.
 *
 * @package XML Sitemap Feed plugin for WordPress
 */
global $plugin_dpc;
$module 	= $plugin_dpc->getModuleInstance('basic', 'sitemaps');
$args 		= array(
				'post_type' 	=> 'page',
				'post_status' 	=> 'publish',
				'orderby'		=> 'modified',
				'posts_per_page' => $module->settings['defaultSeperateSitemap'],
				'suppress_filters' => true
			);
$query 		= new WP_Query($args);

status_header('200'); // force header('HTTP/1.1 200 OK') for sites without posts
header('Content-Type: text/xml; charset=' . get_bloginfo('charset'), true);
echo '<?xml version="1.0" encoding="' . get_bloginfo('charset') . '"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
		http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
';

while($query->have_posts()):
	 $query->the_post();

?>
<url>
	<loc><![CDATA[<?php echo esc_url( get_permalink() ); ?>]]></loc>
	<lastmod><?php echo $post->post_date_gmt;?></lastmod>
	<changefreq>weekly<?php //echo $module->settings['frequencyCpt_page']; ?></changefreq>
 	<priority>50%<?php //echo $module->settings['priorityCpt_page']; ?></priority>
</url>
<?php 
endwhile;
echo '</urlset>';