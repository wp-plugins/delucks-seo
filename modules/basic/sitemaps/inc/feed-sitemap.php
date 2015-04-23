<?php 
global $plugin_dpc;
$module 	= $plugin_dpc->getModuleInstance('basic', 'sitemaps');
$sitemaps 	= $module->getSitemapIndex(); //print_r($sitemaps);
status_header('200'); // force header('HTTP/1.1 200 OK') for sites without posts
header('Content-Type: text/xml; charset=UTF-8' , true);
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<?php if(isset($sitemaps['default']))  foreach ($sitemaps['default'] as $item):?>
	<sitemap>
		<loc><![CDATA[<?php echo $item['url'];?>]]></loc> 
		<?php if (isset($item['lastmod'])):?>
		<lastmod><?php echo $item['lastmod'];?></lastmod>
		<?php endif;?>
	</sitemap>
	<?php endforeach;?>
</sitemapindex>