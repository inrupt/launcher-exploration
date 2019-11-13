import React from 'react';
import { CardMedia, makeStyles } from '@material-ui/core';

interface Props {
  id?: string;
};

const useStyles = makeStyles((theme) => ({
  media: {
    objectPosition: 'top',
  },
}));

export const Screenshot: React.FC<Props> = (props) => {
  const classes = useStyles();
  const [source, setSource] = React.useState();

  React.useEffect(() => {
    if (!props.id) {
      return;
    }
    import(`../screenshots/${props.id}.png`).then((image) => {
      setSource(image.default);
    });
  }, [props.id]);

  if (!source) {
    return null;
  }

  return (
    <CardMedia className={classes.media} component="img" height="200" image={source}/>
  );
};
