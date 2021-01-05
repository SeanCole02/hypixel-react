import React, { useEffect, useRef, useState } from 'react';
import './PriceGraph.css';
import Chart, { ChartConfiguration } from 'chart.js';
import api from '../../api/ApiHelper';
import priceConfig from './PriceGraphConfig'
import { DEFAULT_DATE_RANGE, getTimeSpanFromDateRange, ItemPriceRange } from '../ItemPriceRange/ItemPriceRange';
import { getLoadingElement } from '../../utils/LoadingUtils'
import { convertTagToName } from '../../utils/Formatter';

interface Props {
    item: Item,
    enchantmentFilter?: EnchantmentFilter
}

function PriceGraph(props: Props) {

    const priceChartCanvas = useRef<HTMLCanvasElement>(null);
    let [priceChart, setPriceChart] = useState<Chart>();
    let [fetchspan, setFetchspan] = useState(getTimeSpanFromDateRange(DEFAULT_DATE_RANGE));
    let [isLoading, setIsLoading] = useState(false);
    let [noDataFound, setNoDataFound] = useState(false);

    useEffect(() => {
        if (priceChartCanvas && priceChartCanvas.current) {
            let chart = priceChart || createChart(priceConfig);
            setPriceChart(chart);
            if (props.item) {
                updateChart(chart, fetchspan);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceChartCanvas, props.item, props.enchantmentFilter])

    let updateChart = (priceChart: Chart, fetchspan: number) => {
        setIsLoading(true);
        priceChart.data.labels = [];
        priceChart.data.datasets![0].data = [];
        priceChart.options.title!.text = "Price for 1 " + convertTagToName(props.item.tag);
        priceChart.update();
        setPriceChart(priceChart);

        api.getItemPrices(props.item.tag, fetchspan, undefined, props.enchantmentFilter).then((results) => {
            priceChart.clear();
            priceChart!.data.labels = results.map(item => item.end.getTime());
            priceChart!.data.datasets![0].data = results.map(item => {
                return item.price;
            });
            priceChart!.data.labels = priceChart!.data.labels.sort((a, b) => {
                return (a as number) - (b as number);
            });
            priceChart.update();

            setPriceChart(priceChart);
            setNoDataFound(results.length === 0)
            setIsLoading(false);
        });
    };

    let createChart = (chartConfig: ChartConfiguration): Chart => {
        return new Chart(priceChartCanvas.current as HTMLCanvasElement, chartConfig);
    };

    let onRangeChange = (timespan: number) => {
        setFetchspan(timespan);
        if (priceChart) {
            updateChart(priceChart!, timespan);
        }
    }

    return (
        <div className="price-graph">
            <ItemPriceRange onRangeChange={onRangeChange} disabled={isLoading} item={props.item} />
            { isLoading ? (
                <div className="graph-overlay">
                    <div style={{ position: "relative", left: "-50%" }}>
                        {getLoadingElement()}
                    </div>
                </div>) : ""}
            {noDataFound && !isLoading ?
                <div className="graph-overlay">
                    <div style={{ position: "relative", left: "-50%" }}>
                        <div style={{ textAlign: "center" }}>
                            <p>No data found</p>
                        </div>
                    </div>
                </div> : ""}
            <canvas ref={priceChartCanvas} />
        </div >
    );
}

export default PriceGraph;
