import React, { useState } from 'react';
import { Button, Fade, Menu, MenuItem } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import { useParams } from "react-router-dom";
import './OptionsMenu.css';

interface Props {
    selected?: Player | Item
}
interface AvailableLinks {
    title: string;
    url: string;
}

function OptionsMenu(props: Props) {

    let [anchorEl, setAnchorEl] = useState(null);

    let { tag } = useParams();

    let available: AvailableLinks[] = [];
    const isItemPage = window.location.href.indexOf("/item/") > 0;
    const isPlayerPage = window.location.href.indexOf("/player/") > 0;
    if (isItemPage) {
        let name = props.selected?.name;
        available.push({ title: "Wiki", url: "https://hypixel-skyblock.fandom.com/wiki/" + name })
        if ((props.selected as Item).bazaar)
            available.push({ title: "Skyblock.bz", url: "https://Skyblock.bz/product/" + tag })
        else
            available.push({ title: "HyAuctions", url: "https://craftlink.xyz/items/" + tag })
    } else if (isPlayerPage) {
        let player = (props.selected as Player);
        available.push({ title: "SkyCrypt", url: "https://sky.shiiyu.moe/stats/" + player?.uuid })
        available.push({ title: "Plancke", url: "https://plancke.io/hypixel/player/stats/" + player?.uuid })
        available.push({ title: "HyAuctions", url: "https://auctions.craftlink.xyz/players/" + player?.uuid })
    }


    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigate = (url: string) => {
        window.open(url, "_blank")
    }

    return (
        <div className="options-menu">
            <div className="d-none d-md-block">
                {available.map((result, i) => (
                    <a key={i} href={result.url} title={result.title} target="_blank" rel="noreferrer"><Button variant="outlined" >{result.title}</Button></a>
                ))}
            </div>

            {available.length === 0 ? "" :
                <div className="d-md-none">
                    <Button aria-controls="fade-menu" aria-haspopup="true" onClick={handleClick}>
                        <MoreVert />
                    </Button>
                    <Menu
                        id="fade-menu"
                        aria-label="open menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                    >
                        {available.map((result, i) => (
                            <MenuItem key={i} onClick={(e: any) => { navigate(result.url) }}>{result.title}</MenuItem>
                        ))}
                    </Menu>
                </div>
            }
        </div >
    );
}

export default OptionsMenu;
