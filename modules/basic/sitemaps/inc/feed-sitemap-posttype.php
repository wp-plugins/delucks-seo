<?php 
/**
 * XML Sitemap Feed Template for pages feed.
 *
 * @package XML Sitemap Feed plugin for WordPress
 */
global $plugin_dpc;
$module		= $plugin_dpc->getModuleInstance('basic', 'sitemaps');
$posttype 	= str_replace('sitemap-posttype-', '', get_query_var( 'feed' )); // sitemap-posttype-xxxx
$query 		= $module->getPosts($posttype);

status_header('200'); // force header('HTTP/1.1 200 OK') for sites without posts
header('Content-Type: text/xml; charset=UTF-8' , true);
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
		http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<?php while($query->have_posts()): $query->the_post(); ?>
	<url>
		<loc><![CDATA[<?php echo esc_url( get_permalink() ); ?>]]></loc>
		<lastmod><?php echo mysql2date('Y-m-d\TH:i:s+00:00',$post->post_modified_gmt);?></lastmod>
		<changefreq><?php echo $module->settings['default']['cpt'][$posttype]['frequence']; ?></changefreq>
	 	<priority><?php echo $module->settings['default']['cpt'][$posttype]['priority'] ; ?></priority>
	</url>
<?php endwhile; ?>
</urlset>